package PerlAmp::Maki::Variable;

# this file defines an variable object.

use strict;
use PerlAmp::Maki::Objects;

use constant TYPE_BOOLEAN => 5;
use constant TYPE_INT => 2;
use constant TYPE_FLOAT => 3;
use constant TYPE_DOUBLE => 4;
use constant TYPE_STRING => 6;


# this is the Maki variable object
sub new {
  my $class = shift;
  my $num = shift;
  my $global = shift;
  my $type = shift;

  my $self = {
              type => $type,
              typename => undef,
              value => 0,
              num => $num,
              class => 0,
              global => $global,
              constant => 1,
              used => 0,
              name => undef,
             };

  bless $self, $class;

  return $self;
}


# returns the type of this variable
sub type {
  my $self = shift;
  return $self->{type};
}

# return a true value if this variable
# is an object type
sub object {
  my $self = shift;
  return ref( $self->type ) ? 1: 0;
}

# gets  the name of the type of this variable
sub typename {
  my $self = shift;

  return $self->{typename} if defined $self->{typename};

  my $type = $self->type;

  # is it an object sub-type?
  if( ref( $type ) eq "PerlAmp::Maki::Variable" ) {
    return $type->name;

  # is it an object?
  } elsif( ref( $type ) ) {
    return $type->{name};
  }

  # ok, not
  return "Boolean" if $type == TYPE_BOOLEAN;
  return "Int"     if $type == TYPE_INT;
  return "Float"   if $type == TYPE_FLOAT;
  return "Double"  if $type == TYPE_DOUBLE;
  return "String"  if $type == TYPE_STRING;
  return "Float" if $type == TYPE_FLOAT;
  return "Unknown";
}

# gets or sets the value of this variable
sub value {
  my $self = shift;

   # set
  if( scalar @_ ) {
    $self->{value} = shift;
    return;

  # get
  } else {
    return $self->{value};
  }
}


# set the value from the uints read by the parser
sub setValueFromUints {
  my $self = shift;
  my @uints = @_;
  my $type = $self->type;

  # is it an object?
  if( ref( $type ) ) {
    return $type->{name};
  }

  if( $type == TYPE_BOOLEAN ) {
    $self->{value} = $uints[0];

  } elsif( $type == TYPE_INT ) {
    $self->{value} = $uints[0];

  } elsif( $type == TYPE_FLOAT ||
           $type == TYPE_DOUBLE ) {
    my $exponent = ($uints[1] & 0xff80) >> 7;
    my $mantisse = (0x80 | ($uints[1] & 0x7f)) << 16 | $uints[0];
    $self->{value} = $mantisse*(2.0**($exponent-0x96));

  }

}

# returns the unique number of this variable
sub num {
  my $self = shift;
  return $self->{num};
}

# get or set the name of this variable
sub name {
  my $self = shift;

  # set
  if( scalar @_ ) {
    $self->{name} = shift;
    return;

  # get
  } else {

    return $self->{name} if defined $self->{name};

    # classes have a special name
    return $self->typename.$self->{num}."Class" if( $self->class );

    # constants have no real name
    if( $self->constant ) {

      # protect string
      if( $self->typename eq 'String' ) {
        return "\"".quotemeta($self->value)."\"";

      } else {
        return $self->value;
      }
    }
    return $self->typename.$self->{num};
  }
}


# get or set if this is a class instead of a real variable
sub class {
  my $self = shift;

  # set
  if( scalar @_ ) {
    $self->{class} = shift;
    return;

  # get
  } else {
    return $self->{class};
  }
}


# get or set the global of this variable
sub global {
  my $self = shift;

  # set
  if( scalar @_ ) {
    $self->{global} = shift;
    return;

  # get
  } else {
    return $self->{global};
  }
}


# get or set the constant of this variable
sub constant {
  my $self = shift;

  # set
  if( scalar @_ ) {
    $self->{constant} = shift;
    return;

  # get
  } else {
    return $self->{constant};
  }
}


# get or set the used of this variable
sub used {
  my $self = shift;

  # set
  if( scalar @_ ) {
    $self->{used} = shift;
    return;

  # get
  } else {
    return $self->{used};
  }
}


# return true if this variable is a system variable (not directly outputted)
sub system {
  my $self = shift;

  return 1 if( $self->typename eq "System" );
  return 1 if( $self->typename eq "Config" );
  return 1 if( $self->typename eq "Int" && $self->num == 1 );
  return 0;
}

1;
