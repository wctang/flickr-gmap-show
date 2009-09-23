sub openf {
	my $filen = shift;
	my $OUTPUT = shift;
	my $line;
	
	print "load $filen\n";
	
	open(DAT, $filen) || die("Could not open file! $filen");
	my @codedata=<DAT>;
	close(DAT);
	
	foreach $line (@codedata) {
		if($line =~ /^\/\*include (.*) \*\//) {
			openf($1,$OUTPUT);
		} else {
			print $OUTPUT $line;
		}
	}
}

my $filen=shift;
my $out=shift;
open(OUT, ">$out") || die("Could not open file!");
openf($filen,OUT);
close(OUT);

print "\n";
