package PerlAmp::Maki::Code;

# this file contains MAKI code definitions and
# convinience functions.

use strict;
use PerlAmp::Maki::Command;



# given an array of decodings as produced by parseCommands
# merge easy commands into a tree
sub mergeCommands {
  my @decodings = @_;
  my @stack = ();
  my %arrayPos; # positions of the commands in the array

  for( my $i = 0; $i<scalar(@decodings); $i++ ) {
    my $command = $decodings[$i];

    # function call
    if( ($command->opcode == 24 ||
         $command->opcode == 112 )&&
        scalar(@stack) >= 1 ) {

      my $function = $command->arguments->[0];

      for( my $j=0; $j<scalar( @{$function->{parameters}} )+1; $j++ ) {
        my $param = pop( @stack );
        push( @{$command->arguments}, $param );
        splice( @decodings, $arrayPos{$param}, 1 );
        $i--;
      }

    # function callGlobal
    } elsif( $command->opcode == 25 ) {

      my $function = $command->arguments->[0];

      for( my $j=0; $j<scalar( @{$function->{parameters}} ); $j++ ) {
        my $param = pop( @stack );
        push( @{$command->arguments}, $param );
        splice( @decodings, $arrayPos{$param}, 1 );
        $i--;
      }

    # normal command
    } elsif( scalar(@stack) >= $command->command->{in} ) {

      for( my $j=0; $j<$command->command->{in}; $j++ ) {
        my $param = pop( @stack );
        push( @{$command->arguments}, $param );
        splice( @decodings, $arrayPos{$param}, 1 );
        $i--;
      }
    }

    $arrayPos{$command} = $i;

    # Precondition: $command->{out}==0,1 or else the code fails later!
    if( $command->command->{out} == 1 ) {
      push( @stack, $command );
    }

  } # end for

  return @decodings;
}





# return the index of the code at or behind the given position
sub codeIndexOfPos {

  my $codeArray = shift;
  my $pos = shift;

  for( my $j = 0; $j<scalar(@{$codeArray}); $j++ ) {
    return $j if( defined( $codeArray->[$j] ) &&
                  $codeArray->[$j]->pos >= $pos );
  }
  return undef;
}

# given an array, it expands all back jumps to whiles.
# precondition: mergeCommands have been run
sub expandJumps {
  my @codes = @_;

  # returns the code at the offset of the given codes line plus offset
  sub lineTargetCode {
    my $codes = shift;
    my $command = shift;
    my $offset = shift;

    return undef if( ! (ref( $command->arguments->[0] ) eq "HASH") );
    return undef if( ! defined( $command->arguments->[0]->{line} ) );
    my $targetPos = $command->pos+$command->arguments->[0]->{line}+$offset;
    my $targetIndex = codeIndexOfPos( \@{$codes}, $targetPos );
    return undef if( ! defined( $targetIndex ) );
    return $codes->[$targetIndex];
  }

  for( my $i = 0; $i<scalar(@codes); $i++ ) {
    my $command = $codes[$i];

    # line argument so we have a jump at least
    my $targetCommand = lineTargetCode( \@codes, $command, 0 );
    if( defined( $targetCommand ) ) {

      # we have an ifnot
      if( $command->opcode == 17 ) {
          splice( @codes,  codeIndexOfPos( \@codes, $targetCommand->pos ), 0,
                  PerlAmp::Maki::Command->newBlockEnd( $targetCommand->pos ) );
          $command->removeArgument(); # remove line number argument
          next;
      }

      # we have an if
      if( $command->opcode == 16 ) {
        # print "haveIf\n";

        # check if we have a while
        my $beforeTargetCommand = lineTargetCode( \@codes, $command, -5 );
        # print "beforeTarget pos ",$beforeTargetCode->pos,"\n";

        # -- if-else
        if( defined( $beforeTargetCommand ) &&
            $beforeTargetCommand->opcode == 18 &&
            $beforeTargetCommand->arguments->[0]->{line} > 0) {

          $command->removeArgument(); # remove line number argument
          $beforeTargetCommand->changeToElse();
          # and add an end-bloc after else
          my $jumpOverCommand = lineTargetCode( \@codes, $beforeTargetCommand, 0 );

          splice( @codes, codeIndexOfPos( \@codes, $jumpOverCommand->pos ), 0,
                  PerlAmp::Maki::Command->newBlockEnd( $jumpOverCommand->pos ) );
          $beforeTargetCommand->removeArgument(); # remove line number argument
          next;


        # -- while
        } elsif( defined( $beforeTargetCommand ) &&
                 $beforeTargetCommand->opcode == 18 &&
                 lineTargetCode( \@codes, $beforeTargetCommand, 0 ) == $command ) {

          $command->changeToWhile();
          $command->removeArgument(); # remove line number argument
          splice( @codes, codeIndexOfPos( \@codes, $beforeTargetCommand->pos ), 1,
                  PerlAmp::Maki::Command->newBlockEnd( $beforeTargetCommand->pos ) );
          next;

        # -- normal if
        } else {
          splice( @codes, codeIndexOfPos( \@codes, $targetCommand->pos ), 0,
                  PerlAmp::Maki::Command->newBlockEnd( $targetCommand->pos ) );
          $command->removeArgument(); # remove line number argument
          next;
        }

      }
    }
  }

  return @codes;
}



# returns a textual representation of the decoding
sub decodingToString {
  my $thing = shift;
  my $short = shift;

  return "undef" if( ! defined( $thing ) );

  if( ref( $thing ) eq "PerlAmp::Maki::Command" ) {

    my $arguments = $thing->arguments;
    my $argCount = scalar( @$arguments );

    # a object function call. Special handling for this
    if ( ($thing->opcode == 24 ||
          $thing->opcode == 112 ) && $short ) {

      my $res;

      # object
      $res = decodingToString( $arguments->[$argCount-1], $short );
      # function
      $res .= ".".decodingToString( $arguments->[0], $short )."(";

      # arguments
      for ( my $i = 1; $i<$argCount-1; $i++ ) {
        $res .= ", " if( $i >1 );
        $res .= decodingToString( $arguments->[$i], $short );
      }

      $res .= ")";
      return $res;

      # a function call. Special handling for this
    } elsif ( $thing->opcode == 25 && $short ) {

      my $res;

      # function
      $res .= decodingToString( $arguments->[0], $short )."(";

      # arguments
      for ( my $i = 1; $i<$argCount; $i++ ) {
        $res .= ", " if( $i >1 );
        $res .= decodingToString( $arguments->[$i], $short );
      }

      $res .= ")";
      return $res;

      # a normal command with one or two arguments
    } else {
      if ( $argCount == 0 ) {
        return decodingToString( $thing->command, $short );

      } elsif ( $argCount == 1 ) {
        # some commands like $i-- want the argument before the operation
        if( $thing->command->{post} ) {
          return "( ".decodingToString( $arguments->[0], $short )." ".
            decodingToString( $thing->command, $short ).")";

        } else {
          return "( ".decodingToString( $thing->command, $short )." ".
            decodingToString( $arguments->[0], $short ).")";
        }

      } elsif ( $argCount == 2 ) {
        return "( ".decodingToString( $arguments->[1], $short )." ".
          decodingToString( $thing->command, $short )." ".
            decodingToString( $arguments->[0], $short ).")";

      }
    }

  } elsif( ref( $thing ) eq "PerlAmp::Maki::Variable" ) {
      return $thing->name;

  } elsif( ref( $thing ) eq "HASH" ) {

    # ok, no command but any other thing. It should have at least a name.
    # (e.g. variables, functions, types)
      if( $short &&
          defined( $thing->{short} ) ) {
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



1;
