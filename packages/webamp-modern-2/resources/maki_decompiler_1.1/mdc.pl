#! /usr/bin/perl -w

use strict;
use Getopt::Long;
use Data::Dumper;
use Carp ();
local $SIG{__WARN__} = \&Carp::cluck;

use PerlAmp::Maki::Objects;
use PerlAmp::Maki::Code;
use PerlAmp::Maki::Parse;
use PerlAmp::Maki::Variable;
use PerlAmp::Maki::Command;

my $argShort = 1;
my $result;

$result = GetOptions( "short|s!"   => \$argShort,
		      "help|h" => \&usage,
                      "version|v" => \&version,
		    );
if ( $result != 1 ) {
  usage();
}
if( scalar( @ARGV ) == 0 ) {
  die( "Please give at least one input file\n" );
}

foreach( @ARGV ) {

  open( INPUT, "<$_" ) or die( "Could not open $_: $!\n" );
  PerlAmp::Maki::Parse::parseMagic( *INPUT );
  PerlAmp::Maki::Parse::parseVersion( *INPUT );
  PerlAmp::Maki::Parse::parseUInt32( *INPUT );
  my @types = PerlAmp::Maki::Parse::parseTypes( *INPUT );

  my @funcNames = PerlAmp::Maki::Parse::parseFuncNames( *INPUT, \@types );
  my @variables = PerlAmp::Maki::Parse::parseVariables( *INPUT, \@types );
  my @constants = PerlAmp::Maki::Parse::parseConstants( *INPUT, \@variables );

  my @functions = PerlAmp::Maki::Parse::parseFunctions( *INPUT, \@funcNames, \@variables );
  my $code = PerlAmp::Maki::Parse::parseFunctionsCode( *INPUT, \@funcNames );

  my @decoding = decodeCode( $code, \@types, \@variables, \@funcNames, \@functions );

  annotateFunctionsCode( \@functions, \@decoding );

  if( $argShort ) {
    cleanupFunctionsRemoveStackProtection( \@functions );
    annotateFunctionsParameters( \@functions );

    foreach( @functions ) {
      $_->{code} = [PerlAmp::Maki::Code::mergeCommands( @{$_->{code}} ) ];
      $_->{code} = [PerlAmp::Maki::Code::expandJumps( @{$_->{code}} ) ];
    }
    cleanupFunctionsRemoveTail( \@functions );
    cleanupFunctionsRemoveDoubleReturns( \@functions );
    annotateFunctionsVariables( \@functions );
    annotateFunctionsResults( \@functions );

    print "/* Note: a decompiler is no invitation to steal code.\n";
    print "   Please respect the the copyright */\n";
    print "\n";
    print "#include \"std.mi\"\n";
  }

  unparseVariables( \@variables );
  print "\n";
  unparseFunctions( \@functions );
  print "\n";

  close( INPUT );
}


sub usage {

    print STDERR <<USAGE;
$_[0]
usage: $0 [options] [file]+

  Output command for shortening files.

Options:
-s, --short   Print the short "C" representation instead of
              the longer parse tree. This is default
              you can switch this behaviour off with --noshort
-h, --help    Show this summary.

Examples:
Call the decompiler, pipe the result through indent and write
it to test.m
  perl mdc.pl test.maki | indent > test.m

Try to find out a little bit more about the produced code
  mdc.pl --noshort test.maki

USAGE

  exit( 1 );
}


sub version {

    print STDERR <<USAGE;
$0
version 1.1
Copyright 2005, Ralf Engels
USAGE

  exit( 0 );
}




# decodes the function and returns an array containing 
# the decoded commands.
sub decodeCode {
  my $code = shift;
  my $types = shift;
  my $variables = shift;
  my $funcNames = shift;
  my $functions = shift;
  my $pos = 0;
  my @res;

  my %localFunctions;

  while( $pos < length($code) ) {

    my $command = PerlAmp::Maki::Command->new( $code, $pos,
                                               $types, $variables, $funcNames,
                                               \%localFunctions );

    $pos += $command->size;
    push @res, $command;
  }

  # now add the found local functions to the normal functions
  foreach( keys(%localFunctions) ) {
    push @{$functions}, $localFunctions{$_};
  }
  # and now sort the vector by offset again
  @{$functions} = sort {$a->{offset} <=> $b->{offset}} @{$functions};

  return @res;
}


# given an array of function structures, adds an "code" attribute
# precondition decodeCode was run
sub annotateFunctionsCode {

  my $functions = shift;
  my $decoding = shift;

  @{$functions} = sort {$a->{offset} <=> $b->{offset}} @{$functions};

  foreach my $function ( @{$functions} ) {
    $function->{code} = [];
  }

  my $func = -1;
  foreach my $code ( @{$decoding} ) {
    if( $func+1<scalar( @$functions ) &&
        $code->pos >= $functions->[$func+1]->{offset} ) {

      $func++;
    }

    push( @{$functions->[$func]->{code}}, $code ) if( $func>=0 &&
                                                      $func<scalar( @$functions ) );
  }

}


# given an array of function structures, removes stack protection code from the start of the function
# precondition decodeCode was run
# precondition annotateFunctionsCode was run
# precondition mergeCommands was not run
sub cleanupFunctionsRemoveStackProtection {
  my $functions = shift;

  my $stackProtFunction;
  my $stackProtVar;

  # first find stack protection function..
  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    if( scalar( @code ) == 32 &&
        $code[2]->opcode == 24 &&
        $code[2]->arguments->[0]->{name} eq "getRuntimeVersion" &&
        $code[24]->opcode == 24 &&
        $code[24]->arguments->[0]->{name} eq "messageBox") {
      $stackProtFunction = $function;
      $stackProtVar = $code[13]->{arguments}->[0];
      $function->{stackProtection} = 1;
    }

    if( scalar( @code ) == 66 &&
        $code[2]->opcode == 24 &&
        $code[2]->arguments->[0]->{name} eq "getRuntimeVersion" &&
        $code[22]->opcode == 24 &&
        $code[22]->arguments->[0]->{name} eq "getSkinName" &&
        $code[58]->opcode == 24 &&
        $code[58]->arguments->[0]->{name} eq "messageBox") {
      $stackProtFunction = $function;
      $stackProtVar = $code[13]->arguments->[0];
      $function->{stackProtection} = 1;
    }
  }

  return if( ! $stackProtFunction );

  # now remove all calls to it.
  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    # this is the call to the stack protection function
    if( scalar( @code ) >= 4 &&
        $code[0]->opcode == 25 &&
        $code[0]->arguments->[0] == $stackProtFunction->{function} &&
        $code[3]->opcode == 33 ) {
     splice( @{$function->{code}}, 0, 4 );
    }


    # this is a check for the stack protection variable
    for( my $i = 0; $i < scalar( @code )-4; $i++ ) {
      if( $code[$i+0]->opcode == 1 &&
          $code[$i+0]->arguments->[0] == $stackProtVar &&
          $code[$i+3]->opcode == 33 ) {
        splice( @{$function->{code}}, $i, 4 );
        last;
      }
    }

  }
}

# given an array of function structures, removes stupid trailing code
# precondition decodeCode was run
# precondition annotateFunctionsCode was run
# precondition mergeCommands was run
sub cleanupFunctionsRemoveTail {
  my $functions = shift;

  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    # find last return (before a block end marker)
    my $lastReturnIndex = scalar( @code )-1;
    for( my $i = scalar( @code )-1; $i>=0; $i-- ) {
      $lastReturnIndex = $i if( $code[$i]->opcode == 33 );
      last if( $code[$i]->opcode == 301 ); # this is a block end marker
    }

    splice( @code, $lastReturnIndex+1 );
    $function->{code} = \@code;
  }
}

# given an array of function structures, merges multiple returns into one.
# precondition decodeCode was run
# precondition annotateFunctionsCode was run
# precondition mergeCommands was run
# precondition expandJumps was run
sub cleanupFunctionsRemoveDoubleReturns {
  my $functions = shift;

  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    for( my $i = 1; $i< scalar( @code ); $i++ ) {
      if( $code[$i-1]->opcode == 33 &&
          $code[$i]->opcode == 33 ) {
        splice( @code, $i, 1 );
        $i--;
      }
    }

    $function->{code} = \@code;
  }
}



# given an array of function structures, adds function->parameters if not already given
# for this it uses the popTo opcodes from an decoded code array, removing them in the process.
# precondition decodeCode was run
# precondition annotateFunctionsCode was run
sub annotateFunctionsParameters {

  my $functions = shift;

  @{$functions} = sort {$a->{offset} <=> $b->{offset}} @{$functions};

  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    # function parameters unknown. determine them
    if( ! defined( $function->{function}->{parameters} ) ) {

      $function->{function}->{parameters} = [];

      foreach( @code ) {
        if( $_->opcode == 3 )
          {
            push( @{$function->{function}->{parameters}},
                  [$_->arguments->[0]->typename,
                   $_->arguments->[0]->name] );
            $_->arguments->[0]->constant( 0 );
          }
      }

      # function parameters known. Rename the variables
    } else {

      my $count = 0;
      foreach( @code ) {
        if( $_->opcode == 3 &&
            exists($function->{function}->{parameters}->[$count])  )
          {
            $_->arguments->[0]->name( $function->{function}->{parameters}->[$count]->[1] );
            $_->arguments->[0]->constant( 0 );
            $count++;
          }
      }
    }

  }
}


# given an array of function structures, adds variables
# it checks which variables are used inside the function and which ones are written to.
# for this it uses the pop opcodes from an decoded code array
# precondition mergeCommands was run
# precondition annotateFunctionsCode was run
sub annotateFunctionsVariables {

  my $functions = shift;

  @{$functions} = sort {$a->{offset} <=> $b->{offset}} @{$functions};

  foreach my $function ( @{$functions} ) {
    next if( $function->{stackProtection} ); # we can skip the getRuntimeVersion function. No need to handle those variables.

    my @code = @{$function->{code}};

    $function->{variables} = {};

    sub annotateRecursive {
      my $function = shift;
      my $dec = shift;
      return unless( defined( $dec ) &&
                     ref( $dec ) eq "PerlAmp::Maki::Command" );

      foreach ( @{$dec->{arguments}} ) {
        annotateRecursive( $function, $_ );
      }

      # a push. The variable is used
      if( $dec->opcode == 1 ) {
        my $varNum = $dec->arguments->[0]->num;

        $dec->{arguments}->[0]->used( 1 );
        $function->{variables}->{ $varNum } = { variable => $dec->arguments->[0],
                                                parameter => 0,
                                                used => 1 } unless( defined(  $function->{variables}->{ $varNum } ) );

      # a popto
      } elsif ( $dec->opcode == 3 ) {
        my $varNum = $dec->arguments->[0]->num;

        $function->{variables}->{ $varNum } = { variable => $dec->arguments->[0],
                                                parameter => 1,
                                                used => 1 } unless( defined(  $function->{variables}->{ $varNum } ) );


        # a mov. The variable is written to
      } elsif ( $dec->opcode == 48 ) {
        $dec->arguments->[1]->arguments->[0]->constant( 0 );
      }

    }   # end annotateRecursive

    foreach ( @code ) {
      annotateRecursive( $function, $_ ) if ( defined( $_ ) );
    }
  }

}



# given an array of function structures, adds result
# it checks the returns 
# precondition mergeCommands was run
# precondition annotateFunctionsCode was run
sub annotateFunctionsResults {

  my $functions = shift;

  @{$functions} = sort {$a->{offset} <=> $b->{offset}} @{$functions};

  foreach my $function ( @{$functions} ) {
    next if( defined( $function->{function}->{result} ) );

    my @code = @{$function->{code}};

    sub recursiveResults {
      my $function = shift;
      my $dec = shift;
      return unless( defined( $dec ) &&
                     (ref( $dec ) eq "HASH") );

      if( defined( $dec->typename ) ) {
        return $dec->typename;

      # a return
      } elsif( defined( $dec->arguments ) ) {
        foreach( @{$dec->arguments} ) {
          my $typename = recursiveResults( $function, $_ );
          return $typename if( defined( $typename ) );
        }
      }

      return undef;
    }  # end sub

    foreach ( @code ) {
      if( $_->opcode == 33 ) {
        my $typename = recursiveResults( $function, $_ );

        if( defined( $typename ) ) {
          $function->{function}->{result} = $typename;
          last;
        }
     }
    }
  }

}


# outputs all variables
sub unparseVariables {
  my $variables = shift;

  foreach( @{$variables} ) {

    if( $argShort ) {
      if( $_->global &&
          $_->used &&
          ! $_->constant &&
          ! $_->system &&
          ! $_->class ) {
        print "Global ",$_->typename," ",$_->name,";\n";

      } elsif( $_->class ) {
        print "Class ",$_->typename," ",$_->name,";\n";
      }

    } else {

      $_->constant(0); # for noshort output we don't see variables as constant
      print $_->num,": ",$_->typename," ",$_->name,
          ($_->system?" (system)":""),";\n";
    }
  }
}


# assembles a function header and returns it.
sub assembleFunctionHeader {
  my $function = shift;

  my $res = "";

  # -- function result
  $res .= $function->{function}->{result}." "  if( $function->{function}->{result} );

  # -- object function?
  $res .= $function->{variable}->name."." if( defined( $function->{variable} ) );

  # -- function name
  $res .= $function->{function}->{name}."(";

  # -- function parameters
  my @parameters;
  foreach( @{$function->{function}->{parameters}} ) {
    push( @parameters, $_->[0]." ".$_->[1] );
  }
  $res .= join( ", ", @parameters );
  $res .= ")";

  return $res;
}


# outputs functions
sub unparseFunctions {
  my $functions = shift;

  # --- first output function definitions only

  if( $argShort ) {
    foreach my $function ( @{$functions} ) {

      next if( $function->{stackProtection} ); # we can skip the getRuntimeVersion function. It is always included
      next if( defined( $function->{variable} ) ); # this is an object function. we don't need this.

      # print function name
      print "Function ",assembleFunctionHeader( $function ),";\n";
    }
    print "\n";
  }

  # --- now output the function itself

  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    next if( $function->{stackProtection} ); # we can skip the getRuntimeVersion function. It is always included

    # print function name
    print assembleFunctionHeader( $function ),"\n";
    print "{\n";

    # print local variables
    foreach( keys( %{$function->{variables}} ) ) {
      my $var = $function->{variables}->{$_};
      if( !$var->{variable}->constant &&
          !$var->{parameter} &&
          !$var->{variable}->global ) {
        print $var->{variable}->typename," ",$var->{variable}->name,";\n";
      }
    }

    # output code
    foreach( @code ) {

      my $code = PerlAmp::Maki::Code::decodingToString( $_, $argShort );

      if( $argShort ) {

        # make some replaces for readability..
        $code =~ s/\s+/ /g; # replace multiple whitespaces
        $code =~ s/^\s*//g; # replace leading whitespaces
        $code =~ s/\s*$//g; # replace trailing whitespaces
        $code =~ s/^\(\s*pop\s+(.*)\)$/$1/g; # remove leading pop
        $code =~ s/^\(\s*popTo\s+\w+\)$//g; # remove popTo

        $code =~ s/\(\s*(\w+)\s*\)/$1/g; # replace unneeded braces
        $code =~ s/^\(\s*(.*)\s*\)$/$1/g; # replace braces around everything

        $code =~ s/return\s+\(\s*i1\s*\)/return/g; # change return (i1) to return
        $code =~ s/while\s+(.*)/while\($1\) \{/; # change while to while() {
        $code =~ s/^if\s*(.*)/if\($1\) \{/; # change if to if() {
        $code =~ s/^jumpIfNot\s*(.*)/if\(! $1\) \{/; # change ifNot to if( !) {
        $code =~ s/else/\} else \{/; # change else to } else {

        if( length( $code ) > 0 ) {
          $code .= ";" if( ! ($code =~ /[\{\}]$/) );
          print $code,"\n";
        }
      } else {
        print $_->pos,": ",$code,"\n";
      }

    }

    print "}\n";
    print "\n";
  }


}
