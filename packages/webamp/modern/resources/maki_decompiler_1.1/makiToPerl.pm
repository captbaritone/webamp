#! /usr/bin/perl -w

use strict;

use Data::Dumper;
use Carp ();
local $SIG{__WARN__} = \&Carp::cluck;

use Maki::Objects;
use Maki::Code;
use Maki::Parse;

my $argShort = 1;
my $result;


foreach( @ARGV ) {

  open( INPUT, "<$_" ) or die( "Could not open $_: $!\n" );
  Maki::Parse::parseMagic( *INPUT );
  Maki::Parse::parseVersion( *INPUT );
  Maki::Parse::parseUInt32( *INPUT );
  my @types = Maki::Parse::parseTypes( *INPUT );

  my @funcNames = Maki::Parse::parseFuncNames( *INPUT, \@types );
  my @variables = Maki::Parse::parseVariables( *INPUT, \@types );
  my @constants = Maki::Parse::parseConstants( *INPUT, \@variables );

  my @functions = Maki::Parse::parseFunctions( *INPUT, \@funcNames, \@variables );
  my $code = Maki::Parse::parseFunctionsCode( *INPUT, \@funcNames );

  my @decoding = decodeCode( $code, \@types, \@variables, \@funcNames, \@functions );

  annotateFunctionsCode( \@functions, \@decoding );

  if( $argShort ) {
    cleanupFunctionsRemoveStackProtection( \@functions );
    annotateFunctionsParameters( \@functions );

    foreach( @functions ) {
      $_->{code} = [Maki::Code::mergeCommands( @{$_->{code}} ) ];
      $_->{code} = [Maki::Code::expandJumps( @{$_->{code}} ) ];
    }
    cleanupFunctionsRemoveTail( \@functions );
    cleanupFunctionsRemoveDoubleReturns( \@functions );
    annotateFunctionsVariables( \@functions );
    annotateFunctionsResults( \@functions );

    print "#include \"std.mi\"\n";
  }

  unparseVariables( \@variables );
  print "\n";
  unparseFunctions( \@functions );
  print "\n";

  close( INPUT );
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

    my $command = Maki::Code::parseCommand( $code, $pos,
                                            $types, $variables, $funcNames,
                                            \%localFunctions );

    $pos += $command->{'size'};
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

  my $func = 0;
  foreach my $code ( @{$decoding} ) {
    if( exists( $functions->[$func+1] ) &&
        $code->{pos} >= $functions->[$func+1]->{offset} ) {

      $func++;
    }

    push( @{$functions->[$func]->{code}}, $code ) if( exists( $functions->[$func] ) );
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
        $code[2]->{opcode} == 24 &&
        $code[2]->{arguments}->[0]->{name} eq "getRuntimeVersion" &&
        $code[24]->{opcode} == 24 &&
        $code[24]->{arguments}->[0]->{name} eq "messageBox") {
      $stackProtFunction = $function;
      $stackProtVar = $code[13]->{arguments}->[0];
      $function->{stackProtection} = 1;
    }

    if( scalar( @code ) == 66 &&
        $code[2]->{opcode} == 24 &&
        $code[2]->{arguments}->[0]->{name} eq "getRuntimeVersion" &&
        $code[22]->{opcode} == 24 &&
        $code[22]->{arguments}->[0]->{name} eq "getSkinName" &&
        $code[58]->{opcode} == 24 &&
        $code[58]->{arguments}->[0]->{name} eq "messageBox") {
      $stackProtFunction = $function;
      $stackProtVar = $code[13]->{arguments}->[0];
      $function->{stackProtection} = 1;
    }
  }

  return if( ! $stackProtFunction );

  # now remove all calls to it.
  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    # this is the call to the stack protection function
    if( scalar( @code ) >= 4 &&
        $code[0]->{opcode} == 25 &&
        $code[0]->{arguments}->[0] == $stackProtFunction->{function} &&
        $code[3]->{opcode} == 33 ) {
     splice( @{$function->{code}}, 0, 4 );
    }


    # this is a check for the stack protection variable
    for( my $i = 0; $i < scalar( @code )-4; $i++ ) {
      if( $code[$i+0]->{opcode} == 1 &&
          $code[$i+0]->{arguments}->[0] == $stackProtVar &&
          $code[$i+3]->{opcode} == 33 ) {
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
      $lastReturnIndex = $i if( $code[$i]->{opcode} == 33 );
      last if( $code[$i]->{opcode} == 301 ); # this is a block end marker
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
      if( $code[$i-1]->{opcode} == 33 &&
          $code[$i]->{opcode} == 33 ) {
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
        if( defined( $_ ) &&
            $_->{opcode} == 3 )
          {
            push( @{$function->{function}->{parameters}},
                  [$_->{arguments}->[0]->{typename},
                   $_->{arguments}->[0]->{name}] );
            $_->{arguments}->[0]->{constant} = 0;
          }
      }

      # function parameters known. Rename the variables
    } else {

      my $count = 0;
      foreach( @code ) {
        if( defined( $_ ) &&
            $_->{opcode} == 3 &&
            exists($function->{function}->{parameters}->[$count])  )
          {
            $_->{arguments}->[0]->{name} = $function->{function}->{parameters}->[$count]->[1];
            $_->{arguments}->[0]->{constant} = 0;
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
                     ref( $dec ) eq "HASH" &&
                     defined($dec->{command}) );

      foreach ( @{$dec->{arguments}} ) {
        annotateRecursive( $function, $_ );
      }

      # a pop. The variable is used
      if ( $dec->{opcode} == 1 &&
           defined( $dec->{arguments} ) ) {
        my $varNum = $dec->{arguments}->[0]->{num};

        $dec->{arguments}->[0]->{used} = 1;
        $function->{variables}->{ $varNum } = { variable => $dec->{arguments}->[0],
                                                parameter => 0,
                                                used => 1 } unless( defined(  $function->{variables}->{ $varNum } ) );

      } elsif ( $dec->{opcode} == 3 ) {
        my $varNum = $dec->{arguments}->[0]->{num};

        $function->{variables}->{ $varNum } = { variable => $dec->{arguments}->[0],
                                                parameter => 1,
                                                used => 1 } unless( defined(  $function->{variables}->{ $varNum } ) );


        # a mov. The variable is written to
      } elsif ( $dec->{opcode} == 48 ) {
        $dec->{arguments}->[1]->{arguments}->[0]->{constant} = 0;
      }
    }                           # end annotateRecursive

    foreach ( @code ) {
      annotateRecursive( $function, $_ ) if ( defined( $_ ) );
    }
  }

  foreach( @{$functions} ) {
    my $function = $_;

    # one last step. Rename constant variables to the constants
    foreach( keys( %{$function->{variables}} ) ) {
      my $var = $function->{variables}->{$_}->{variable};
      if( $var->{constant} ) {
        $var->{name} = $var->{value};
      }
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

      if( defined( $dec->{typename} ) ) {
        return $dec->{typename};

      # a return
      } elsif( defined( $dec->{arguments} ) ) {
        foreach( @{$dec->{arguments}} ) {
          my $typename = recursiveResults( $function, $_ );
          return $typename if( defined( $typename ) );
        }
      }

      return undef;
    }  # end sub

    foreach ( @code ) {
      if ( defined( $_->{opcode} ) &&
           $_->{opcode}  == 33 ) {
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
  my $res = "";

  foreach( @{$variables} ) {

    if( $_->{global} &&
        $_->{used} &&
        ! $_->{constant} &&
        ! $_->{system} ) {
      $res .= "my ",$_->{name},";\n";
    }
  }

  return $res;
}


# assembles a function header and returns it.
sub assembleFunctionHeader {
  my $function = shift;

  my $res = "";

  # -- object function?
  $res .= "package ".$function->{variable}->{name}.";\n" if( defined( $function->{variable} ) );

  # -- function name
  $res .= $function->{function}->{name};

  return $res;
}



# returns a textual representation of the decoding
sub decodingToString {
  my $thing = shift;

  return "undef" if( ! defined( $thing ) );

  if( ref( $thing ) eq "HASH" ) {

    if( $thing->{command} ) {
      my $argCount = scalar( @{$thing->{arguments}} );

      # a object function call. Special handling for this
      if ( ($thing->{command} == $commands{24} ||
            $thing->{command} == $commands{112} ) ) {

        my $res;

        # object
        $res = decodingToString( $thing->{arguments}->[$argCount-1] );
        # function
        $res .= ".".decodingToString( $thing->{arguments}->[0] )."(";

        # arguments
        for ( my $i = 1; $i<$argCount-1; $i++ ) {
          $res .= ", " if( $i >1 );
          $res .= decodingToString( $thing->{arguments}->[$i] );
        }

        $res .= ")";
        return $res;

      # a function call. Special handling for this
      } elsif ( $thing->{command} == $commands{25} ) {

        my $res;

        # function
        $res .= decodingToString( $thing->{arguments}->[0] )."(";

        # arguments
        for ( my $i = 1; $i<$argCount; $i++ ) {
          $res .= ", " if( $i >1 );
          $res .= decodingToString( $thing->{arguments}->[$i] );
        }

        $res .= ")";
        return $res;

        # a normal command with one or two arguments
      } else {
        if ( $argCount == 0 ) {
          return decodingToString( $thing->{command} );

        } elsif ( $argCount == 1 ) {
          # some commands like $i-- want the argument before the operation
          if( $thing->{command}->{post} ) {
            return "( ".decodingToString( $thing->{arguments}->[0] )." ".
              decodingToString( $thing->{command} ).")";

          } else {
            return "( ".decodingToString( $thing->{command} )." ".
              decodingToString( $thing->{arguments}->[0] ).")";
          }

        } elsif ( $argCount == 2 ) {
          return "( ".decodingToString( $thing->{arguments}->[1] )." ".
            decodingToString( $thing->{command} )." ".
              decodingToString( $thing->{arguments}->[0] ).")";

        }
      }

    # ok, no command but any other thing. It should have at least a name.
    # (e.g. variables, functions, types)
    } elsif( defined( $thing->{short} ) ) {
      return $thing->{short};

    } elsif( defined( $thing->{name} ) ) {
      return $thing->{name};

    } else {
      return "undefName";
    }


  } else {
    return $thing;
  }


}


# outputs functions
sub unparseFunctions {
  my $functions = shift;

  # --- now output the function itself

  foreach my $function ( @{$functions} ) {
    my @code = @{$function->{code}};

    next if( $function->{stackProtection} ); # we can skip the getRuntimeVersion function. It is always included

    # print function name
    print "sub ",assembleFunctionHeader( $function )," {\n";

    # -- function parameters
    my @parameters;
    foreach( @{$function->{function}->{parameters}} ) {
      print "my \$",$_->[1]," = shift;\n";
    }

    # print local variables
    foreach( keys( %{$function->{variables}} ) ) {
      my $var = $function->{variables}->{$_};
      if( !$var->{variable}->{constant} &&
          !$var->{parameter} &&
          !$var->{variable}->{global} ) {
        print "my \$",$var->{variable}->{name},";\n";
      }
    }

    # output code
    foreach( @code ) {

      my $code = decodingToString( $_ );

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
        print $_->{pos},": ",$code,"\n";
      }

    }

    print "}\n";
    print "\n";
  }


}
