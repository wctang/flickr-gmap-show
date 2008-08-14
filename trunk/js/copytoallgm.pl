use File::Copy;

my $fxprofile = "$ENV{'APPDATA'}/Mozilla/Firefox/Profiles/";
my $from = shift;

opendir(DIRHANDLE, $fxprofile);
@files = readdir(DIRHANDLE);

foreach $file (@files) {
	next if ($file eq '.' || $file eq '..');
	my $gmdir="$fxprofile$file/gm_scripts/flickr_gmap_show";
	next if not (-d $gmdir);
	
	copy($from, $gmdir);
}
