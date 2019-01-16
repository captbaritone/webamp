#!/usr/bin/perl -w

# funktion to parse the winamps std.mi file

use strict;

my %objects;
my %objectIDs;

while( <> ) {

  if( /\s*extern\s+(.*?)\s+(.*?)\s*\.(.*?)\s*\((.*)\);/ ) { # function definition

    #print "f $1#$2#$3#$4\n";
    my %function;
    $function{'name'} = $3;
    $function{'result'} = $1;
    my $objectName = $2;

    my @args = split( /\s*,\s*/, $4 );
    my @parameters;
    foreach( @args ) {
      if( /^\s*(.*?)\s+(.*)\s*$/ ) {
        push @parameters, [$1, $2];
      }
    }
    $function{'parameters'} = \@parameters;
    push @{$objects{$objectName}->{'functions'}}, \%function;

  } elsif( /\s*extern\s+(.*?)\s*\.(.*?)\s*\((.*)\);/ ) { # function definition

    #print "f $1#$2#$3#$4\n";
    my %function;
    $function{'name'} = $2;
    $function{'result'} = "";
    my $objectName = $1;

    my @args = split( /\s*,\s*/, $3 );
    my @parameters;
    foreach( @args ) {
      if( /^\s*(.*?)\s+(.*)\s*$/ ) {
        push @parameters, [$1, $2];
      }
    }
    $function{'parameters'} = \@parameters;
    push @{$objects{$objectName}->{'functions'}}, \%function;

  } elsif( /\s*extern\s+class\s*\@\{(........-....-....-....-............)\}\@\s*(.*?)\s+(.*?);/ ) { # object definition
    #print "o $1#$2#$3\n";

    my $id = $1;
    my $parent = $2;
    my $name = $3;
    $id =~ s/-//g;
    $name =~ s/^&//;
    $name =~ s/^_predecl //;

    my %object;
    $object{'name'} = $name;
    $object{'parent'} = $parent;
    $object{'functions'} = [];

    $objects{$name} = \%object;
    $objectIDs{$id} = \%object;
  }
}

use Data::Dumper;

print Dumper( \%objectIDs );
