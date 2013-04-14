
var WshShell = WScript.CreateObject("WScript.Shell");
var oExec = WshShell.Exec("%windir%\\system32\\inetsrv\\appcmd.exe list wp");

/*
WP "4316" (applicationPool:xxx)
WP "4080" (applicationPool:yyy)
WP "3200" (applicationPool:zzz)
*/

var RE = /WP "(\d+)" \([^:]+:([^\)]+)\)/

print("{\n");
print("\t\"data\":");
print("\t[");

var next = false;
while (!oExec.StdOut.AtEndOfStream) {

	var line = oExec.StdOut.ReadLine();
	var match = RE.exec(line)

	if (match) {

		if (next) print("\t,");
		next = true;

		print("\t\t{\"{#WPNAME}\":\"" + match[2] + "\"}");
	}
}

print("\t]");
print("}");


function print(text) { WScript.Echo(text); }