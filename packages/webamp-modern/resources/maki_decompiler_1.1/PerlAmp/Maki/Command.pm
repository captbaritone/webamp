package PerlAmp::Maki::Command;

# this file defines a command object.

use strict;
use PerlAmp::Maki::Objects;
use PerlAmp::Maki::Variable;



my %commands = (
                "1" =>
                { name => "push",
                  short => "",
                  arg => "var",
                  in => "0", out => "1",
                },
                "2" =>
                { name => "pop",
                  short => "pop",
                  in => "1", out => "0",
                },
                "3" =>
                { name => "popTo",
                  short => "popTo",
                  arg => "var",
                  in => "0", out => "0",
                  # note in fact popTo takes one
                  # argument but it is not visible to the parser because popTo 
                  # is always at the start of a function
                },
                "8" =>
                { name => "eq",
                  short => "==",
                  in => "2", out => "1",
                },
                "9" =>
                { name => "heq",
                  short => "!=",
                  in => "2", out => "1",
                },
                "10" =>
                { name => "le",
                  short => "<",
                  in => "2", out => "1",
                },
                "11" =>
                { name => "leq",
                  short => "<=",
                  in => "2", out => "1",
                },
                "12" =>
                { name => "gt",
                  short => ">",
                  in => "2", out => "1",
                },
                "13" =>
                { name => "gtq",
                  short => ">=",
                  in => "2", out => "1",
                },

                "16" =>
                { name => "jumpIf",
                  short => "if",
                  arg => "line",
                  in => "1", out => "0",
                },
                "17" =>
                { name => "jumpIfNot",
                  arg => "line",
                  in => "1", out => "0",
                },
                "18" =>
                { name => "jump",
                  arg => "line",
                  in => "0", out => "0",
                },

                "24" =>
                { name => "call",
                  arg => "objFunc",
                  in => "0", out => "1",
                },
                "25" =>
                { name => "callGlobal",
                  arg => "func",
                  in => "0", out => "1",
                },

                "33" =>
                { name => "ret",
                  short => "return",
                  in => "1", out => "0", # note: we claim that return 
                  # pops one argument from the stack, which ist not the full truth.
                },

                "40" =>
                { name => "complete",
                  short => "complete",
                  in => "0", out => "0",
                },

                 "48" =>
                { name => "mov",
                  short => "=",
                  in => "2", out => "1",
                },


                "56" =>
                { name => "postinc",
                  short => "++",
                  post => 1,
                  in => "1", out => "1",
                },
                "57" =>
                { name => "postdec",
                  short => "--",
                  post => 1,
                  in => "1", out => "1",
                },
                "58" =>
                { name => "preinc",
                  short => "++",
                  in => "1", out => "1",
                },
                "59" =>
                { name => "predec",
                  short => "--",
                  in => "1", out => "1",
                },


                "64" =>
                { name => "add",
                  short => "+",
                  in => "2", out => "1",
                },
                "65" =>
                { name => "sub",
                  short => "-",
                  in => "2", out => "1",
                },
                "66" =>
                { name => "mul",
                  short => "*",
                  in => "2", out => "1",
                },
                "67" =>
                { name => "div",
                  short => "/",
                  in => "2", out => "1",
                },
                "68" =>
                { name => "mod",
                  short => "%",
                  in => "2", out => "1",
                },

                "72" =>
                { name => "and",
                  short => "&",
                  in => "2", out => "1",
                },
                "73" =>
                { name => "or",
                  short => "|",
                  in => "2", out => "1",
                },
                "74" =>
                { name => "not",
                  short => "!",
                  in => "1", out => "1",
                },
                "76" =>
                { name => "negative",
                  short => "-",
                  in => "1", out => "1",
                },

                "80" =>
                { name => "logAnd",
                  short => "&&",
                  in => "2", out => "1",
                },
                "81" =>
                { name => "logOr",
                  short => "||",
                  in => "2", out => "1",
                },

                "90" =>
                { name => "lshift",
                  short => "<<",
                  in => "2", out => "1",
                },
                "91" =>
                { name => "rshift",
                  short => ">>",
                  in => "2", out => "1",
                },

                "96" =>
                { name => "new",
                  arg => "obj",
                  in => "0", out => "1",
                },
                "97" =>
                { name => "delete",
                  short => "delete",
                  in => "1", out => "1",
                },

                "112" =>
                { name => "strangeCall",
                  arg => "objFunc",
                  in => "0", out => "1",
                },


                "300" =>
                { name => "blockStart",
                  short => "{",
                  in => "0", out => "0",
                },

                "301" =>
                { name => "blockEnd",
                  short => "}",
                  in => "0", out => "0",
                },

               );


# now some commands for syntax things...
my %commandIf = (
                 name => "if",
                 in => "1", out => "0", );

my %commandElse = (
                   name => "else",
                   in => "0", out => "0", );

my %commandWhile = (
                    name => "while",
                    in => "1", out => "0", );

my %commandDo = (
                 name => "do",
                 in => "0", out => "0", );

my %commandFor = (
                  name => "for",
                  in => "1", out => "0", );


sub decodeUInt32 {
  my $code = shift;

  return (ord( substr( $code, 3, 1 ) ) << 24) +
    (ord( substr( $code, 2, 1 ) ) << 16) +
      (ord( substr( $code, 1, 1 ) ) << 8) +
        (ord( substr( $code, 0, 1 ) ));
}

sub decodeInt32 {
  my $var = decodeUInt32( shift );
  if( $var > 0x7fffffff ) {
    $var = $var-0xffffffff-1;
  }
  return $var;
}





# this is the Maki Command object
sub new {
  my $class = shift;

  my $code = shift;
  my $pos = shift;
  my $types = shift;
  my $variables = shift;
  my $funcNames = shift;
  my $localFunctions = shift;

  my $opcode = ord( substr( $code, $pos, 1 ) );

  my $self = { pos => $pos,
               opcode => $opcode,
               arguments => [],
               command => $commands{ $opcode },
               size => 1,
             };

  if( ! defined( $self->{command} ) ) {
    $self->{command} = { name => "unknown $opcode",
                         in => "0", out => "0", };

  } else {


    if( defined( $self->{command}->{arg} ) ) {

      my $argtype = $self->{command}->{arg};
      my $arg = undef;

      if( $argtype eq "var" ) {
        my $var = decodeUInt32( substr( $code, $pos+1, 4 ) );
        if( exists( $variables->[$var] ) ) {
          $arg = $variables->[$var];
        } else {
          $arg = PerlAmp::Maki::Variable->new( -1,
                                               0,
                                               type => "unknown",
                                             );
          $arg->name("Unknown $var");
        }

      } elsif( $argtype eq "line" ) {
        my $var = decodeInt32( substr( $code, $pos+1, 4 ) ) + 5;
        $arg = { name=>$var,
                 line=>$var, };

      } elsif( $argtype eq "objFunc" ) {
        my $var = decodeInt32( substr( $code, $pos+1, 4 ) );
        if( exists( $funcNames->[$var] ) ) {
          $arg = $funcNames->[$var]->{function};
        } else {
          $arg = { name => "unknown Object Function $var",
                   parameters => [],
                   return => "unknown"
                 };
        }
      } elsif( $argtype eq "func" ) {
        my $var = decodeInt32( substr( $code, $pos+1, 4 ) ) + 5; # todo, something strange going on here...

        if( ! defined( $localFunctions->{$var+$pos} ) ) {
          $localFunctions->{$var+$pos} = { function => {name => ("func".($var+$pos)),
                                                        code => [],
                                                        offset => ($var+$pos),
                                                       },
                                           offset => ($var+$pos) };
        }
        $arg = $localFunctions->{$var+$pos}->{function};

      } elsif( $argtype eq "obj" ) {
        my $var = decodeInt32( substr( $code, $pos+1, 4 ) );
        $arg = $types->[$var];
      }

      $self->{arguments} = [$arg];
      $self->{size} = 5;

      # look forward for a stack protection block 
      # (why do I have to look FORWARD. stupid nullsoft)
      if( length($code) > $pos+5+4 &&
          decodeUInt32( substr( $code, $pos+5, 4 ) ) >= 0xffff0000 ) {
        $self->{size} += 4;
      }

      # this seems to be a special call
      # maybe with build in stack protection?
      if( $opcode == 112 ) {
        $self->{size} += 1;
      }

    } else {

      $self->{size} = 1;
    }

  }

  bless $self, $class;
  return $self;
}



# this is the Maki Blockend object
sub newBlockEnd {
  my $class = shift;

  my $pos = shift;

  my $self = { pos => $pos,
               opcode => 301,
               arguments => [],
               command => $commands{301},
               size => 0,
             };
  bless $self, $class;
  return $self;
}



# returns the position of this command
sub pos {
  my $self = shift;
  return $self->{pos};
}

# returns the opcode of this command
sub opcode {
  my $self = shift;
  return $self->{opcode};
}

# returns the arguments of this command
sub arguments {
  my $self = shift;
  return $self->{arguments};
}

# returns the command of this command
sub command {
  my $self = shift;
  return $self->{command};
}

# returns the size of this command
sub size {
  my $self = shift;
  return $self->{size};
}

# removes one Argument from the argument list
# (needed when merging arguments)
sub removeArgument {
  my $self = shift;
  shift( @{$self->{arguments}} );
}


# change this command to a while command
sub changeToElse {
  my $self = shift;
  $self->{command} = \%commandElse;
}

# change this command to a while command
sub changeToWhile {
  my $self = shift;
  $self->{command} = \%commandWhile;
}


1;
