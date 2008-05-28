all:
	perl parse.pl geophotoshow.org.js ..\geophotoshow.js
	java -jar ../yuicompressor-2.3.5.jar -o ..\geophotoshow-min.js ..\geophotoshow.js
	perl parse.pl flickrgmapshow.user.org.js ..\flickrgmapshow.user.js
	java -jar ../yuicompressor-2.3.5.jar -o ..\flickrgmapshow.user-min.js ..\flickrgmapshow.user.js

	perl copytoallgm.pl ..\flickrgmapshow.user.js
