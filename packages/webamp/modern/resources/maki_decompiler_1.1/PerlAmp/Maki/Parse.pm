package PerlAmp::Maki::Parse;

# this file parses a Maki file

use strict;
use PerlAmp::Maki::Objects;
use PerlAmp::Maki::Variable;

use constant TYPE_BOOLEAN => 5;
use constant TYPE_INT => 2;
use constant TYPE_FLOAT => 3;
use constant TYPE_DOUBLE => 4;
use constant TYPE_STRING => 6;


# Reads a int8 (least significant byte first) from the filehandle.
sub parseUInt8 {
  my $HANDLE = shift;
  my $data;
  read( $HANDLE, $data, 1 ) == 1 or die( "Error: reading input: $!");
  return ord(chop($data));
}

# Reads a int16 (least significant byte first) from the filehandle.
sub parseUInt16 {
  my $HANDLE = shift;
  my $data;
  read( $HANDLE, $data, 2 ) == 2 or die( "Error: reading input: $!");

  # note that we can't write the following on one line or
  # the chop execution order is wrong!
  my $res=(ord(chop($data)) << 8);
  $res += (ord(chop($data)) << 0);

  return $res;
}

# Reads a int32 (least significant byte first) from the filehandle.
sub parseUInt32 {
  my $HANDLE = shift;
  my $data;
  read( $HANDLE, $data, 4 ) == 4 or die( "Error: reading input: $!");

  # note that we can't write the following on one line or
  # the chop execution order is wrong!
  my $res= (ord(chop($data)) << 24);
  $res += (ord(chop($data)) << 16);
  $res += (ord(chop($data)) << 8);
  $res += (ord(chop($data)) << 0);

  return $res;
}

# Reads a string (with leading length) from the filehandle.
sub parseString {
  my $HANDLE = shift;
  my $stringLen = parseUInt16( $HANDLE );
  my $string;
  read( $HANDLE, $string, $stringLen ) == $stringLen or die( "Error: reading input: $!");

  return $string;
}


sub parseMagic {
  my $HANDLE = shift;
  my $data;
  read( $HANDLE, $data, 2 ) == 2 or die( "Error: reading input: $!");

  ($data eq "FG") or die( "Error: magic number does not mach. Is this a maki file?");
}

sub parseVersion {
  my $HANDLE = shift;
  my $data;
  read( $HANDLE, $data, 2 ) == 2 or die( "Error: reading input: $!");

  #($data eq "FG") or die( "Error: magic number does not mach. Is this a maki file?");
}



# parse extern class types (normally from std.mi)
sub parseTypes {
  my $HANDLE = shift;
  my $count = parseUInt32( $HANDLE );
  my @types;

  for( my $i=0; $i<$count; $i++ ) {
    my $data = "";
    $data .= sprintf( "%08x", parseUInt32( $HANDLE ) );
    $data .= sprintf( "%08x", parseUInt32( $HANDLE ) );
    $data .= sprintf( "%08x", parseUInt32( $HANDLE ) );
    $data .= sprintf( "%08x", parseUInt32( $HANDLE ) );
    my $class = PerlAmp::Maki::Objects::getClass($data);
    print STDERR "Warning: unknown class $data at pos $i\n" if( ! defined( $class ) );

    push @types, $class;
  }
  return @types;
}


# parse function definitions
sub parseFuncNames {
  my $HANDLE = shift;
  my $types = shift;
  my $count = parseUInt32( $HANDLE );
  my @funcNames;

  for( my $i=0; $i<$count; $i++ ) {
    my %funcName;
    my $class = parseUInt16( $HANDLE );
    #print "cl $class\n";
    $funcName{class} = $types->[$class & 0xff];
    $funcName{dummy2} = parseUInt16( $HANDLE );
    $funcName{name} = parseString( $HANDLE );
    $funcName{function} =  PerlAmp::Maki::Objects::getObjectFunction( $funcName{class},
                                                             $funcName{name} );
    if( ! defined( $funcName{function} ) ) {
      print STDERR "Warning: unknown Function ",$funcName{class}->{name},".",$funcName{name},"\n";
      $funcName{function} =  { name => "unknown Function ".$funcName{class}->{name}.".".$funcName{name},
                               parameters => [],
                               return => "unknown"
                             };
    }

    push @funcNames, \%funcName;
  }

  return @funcNames;
}


# parse variables definitions
sub parseVariables {
  my $HANDLE = shift;
  my $types = shift;
  my $count = parseUInt32( $HANDLE );
  my @variables;

  for( my $i=0; $i<$count; $i++ ) {
    my $variable;
    my $type   = parseUInt8( $HANDLE );
    my $object = parseUInt8( $HANDLE );
    my $subclass = parseUInt16( $HANDLE );
    my $uint1  = parseUInt16( $HANDLE );
    my $uint2  = parseUInt16( $HANDLE );
    my $uint3  = parseUInt16( $HANDLE );
    my $uint4  = parseUInt16( $HANDLE );
    my $global = parseUInt8( $HANDLE );
    my $system = parseUInt8( $HANDLE );

#    print "Debug: V $i\n";
#    print " $type, $object, $uint1, $uint2\n";
#    print " $uint3, $uint4, $uint5\n";
#    print " $global, $system\n";

    if( $object ) {

      if( defined( $types->[$type] ) ) {
        $variable = PerlAmp::Maki::Variable->new( $i, $global,
                                                  $types->[$type] );
      } else {
        print STDERR "Warning: unknown object variable type $type\n";
        $variable = PerlAmp::Maki::Variable->new( $i, $global,
                                                  $types->[0] );
      }

    } elsif( $subclass ) {

      if( defined( $variables[$type] ) ) {
        $variable = PerlAmp::Maki::Variable->new( $i, $global,
                                                  $variables[$type] );
        $variables[$type]->class(1);
      } else {
        print STDERR "Warning: unknown object variable subtype $type\n";
        $variable = PerlAmp::Maki::Variable->new( $i, $global,
                                                  $types->[0] );
      }

    } else {
      $variable = PerlAmp::Maki::Variable->new( $i, $global, $type );
      $variable->setValueFromUints( $uint1, $uint2, $uint3, $uint4 );
    }


    # the System variable is special
    if( $i == 0 && 
        $variable->typename eq "System" ) {
      $variable->name( $variable->typename );
      $variable->constant( 1 );
    }

    # the Config variable is special
    if( $variable->typename eq "Config" ) {
      $variable->name( $variable->typename );
      $variable->constant( 0 );
    }

    # the first int variable is special
    if( $i == 1 &&
        $variable->typename eq "Int" &&
        $variable->value == "0" ) {
      $variable->name( "Null" );
      $variable->constant( 1 );
    }

    push @variables, $variable;
  }
  return @variables;
}


# parse constant definitions (needs the variables array for this)
sub parseConstants {
  my $HANDLE = shift;
  my $variables = shift;
  my $count = parseUInt32( $HANDLE );
  my @constants;

  for( my $i=0; $i<$count; $i++ ) {
    my %constant;
    my $varNum = parseUInt32( $HANDLE );
    $constant{'varNum'} = $varNum;

    my $typename = $variables->[$varNum]->typename;
    if( $typename eq 'String' ) {
      my $value = parseString( $HANDLE );
      $constant{'value'} = $value;
      # $variables->[$varNum]->{name}  = $value;
      $variables->[$varNum]->value( $value );
    } else {
      print STDERR "Warning: Unknown constant type ",$typename,"\n";
    }

    push @constants, \%constant;
  }
  return @constants;
}


# parse function definitions
# prepares a functions has and annotates all object functions
# with information read from the stream
sub parseFunctions {
  my $HANDLE = shift;
  my $funcNames = shift;
  my $variables = shift;
  my $count = parseUInt32( $HANDLE );
  my @functions;

  for( my $i=0; $i<$count; $i++ ) {
    my %function;
    my $varNum = parseUInt32( $HANDLE );
    my $funcNum = parseUInt32( $HANDLE );
    my $offset = parseUInt32( $HANDLE );

    push @functions, { variable => $variables->[$varNum],
                       function => $funcNames->[$funcNum]->{function},
                       offset   => $offset };

    $funcNames->[$funcNum]->{offset} = $offset;

  }

  return @functions;
}


# parse function definitions
sub parseFunctionsCode {
  my $HANDLE = shift;
  my $stringLen = parseUInt32( $HANDLE );
  my $string;
  read( $HANDLE, $string, $stringLen ) == $stringLen or die( "Error: reading input: $!");

  return $string;
}


1;
