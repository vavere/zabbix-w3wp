
if (WScript.Arguments.Count() != 2) WScript.Quit(1);

var wpname = WScript.Arguments.Item(0);
var counter = WScript.Arguments.Item(1);

switch(counter) {
  case 'IODataOperationsPerSec':
  case 'IOOtherOperationsPerSec':
  case 'IOReadBytesPerSec':
  case 'IOReadOperationsPerSec':
  case 'IOWriteBytesPerSec':
  case 'IOWriteOperationsPerSec':
  case 'IODataBytesPerSec':
  case 'IOOtherBytesPerSec':
  case 'PageFaultsPerSec':
    WScript.Echo(PERF_COUNTER_BULK_COUNT(wpname, counter));
    break;
  case 'HandleCount':
  case 'PageFileBytes':
  case 'PageFileBytesPeak':
  case 'PoolNonpagedBytes':
  case 'PoolPagedBytes':
  case 'PriorityBase':
  case 'PrivateBytes':
  case 'ThreadCount':
  case 'VirtualBytes':
  case 'VirtualBytesPeak':
  case 'WorkingSet':
  case 'WorkingSetPeak':
    WScript.Echo(PERF_COUNTER_RAWCOUNT(wpname, counter));
    break;
  case 'PercentPrivilegedTime':
  case 'PercentProcessorTime':
  case 'PercentUserTime':
    WScript.Echo(PERF_100NSEC_TIMER(wpname, counter));
    break
  default:
    WScript.Quit(1);  
}
WScript.Quit();

//
function PERF_COUNTER_RAWCOUNT(wpname, counter) {

  var pid = getPidByName(wpname);
  if (!pid) return 0;

  var data = getWmiProcess(pid, counter);
  if (data) 
    return data[counter];

  return 0;
}

// 
function PERF_COUNTER_BULK_COUNT(wpname, counter) {

  var pid = getPidByName(wpname);
  if (!pid) return 0;

  var wpdata2 = null
  var data = getWmiProcess(pid, "Frequency_Sys100NS,Timestamp_Sys100NS," + counter);
  if (data) 
    wpdata2 = [pid, data.Timestamp_Sys100NS, data[counter], data.Frequency_Sys100NS];

  filePath = getTempPath(wpname + '_' + counter);

  var wpdata1 = null;
  if (existsFile(filePath)) 
    wpdata1 = readFile(filePath).split(" ");

  writeFile(filePath, wpdata2.join(" "));

  if (wpdata2 && wpdata1 && wpdata2[0] == wpdata1[0]) {
    var d = (wpdata2[1] - wpdata1[1]) / wpdata2[3];
    var n = wpdata2[2] - wpdata1[2];
    return (n/d).toFixed(0);
  }
  return 0;
}

//
function PERF_100NSEC_TIMER(wpname, counter) {

  var pid = getPidByName(wpname);
  if (!pid) return 0;

  var wpdata2 = null
  var data = getWmiProcess(pid, "Timestamp_Sys100NS," + counter);
  if (data) 
    wpdata2 = [pid, data.Timestamp_Sys100NS, data[counter]];

  filePath = getTempPath(wpname + '_' + counter);

  var wpdata1 = null;
  if (existsFile(filePath)) 
    wpdata1 = readFile(filePath).split(" ");

  writeFile(filePath, wpdata2.join(" "));

  if (wpdata2 && wpdata1 && wpdata2[0] == wpdata1[0]) {
    var d = wpdata2[1] - wpdata1[1];
    var n = wpdata2[2] - wpdata1[2];
    return (100 * n/d).toFixed(0);
  }
  return 0;
}

//
function getTempPath(name) {
  var fso = WScript.CreateObject("Scripting.FileSystemObject");
  var tmp = fso.GetSpecialFolder(2).path
  return fso.buildPath(tmp, name);
} 

//
function existsFile(path) {
  var fso = WScript.CreateObject("Scripting.FileSystemObject");
  return fso.fileExists(path);
}

//
function readFile(path) {
  var fso = WScript.CreateObject("Scripting.FileSystemObject");
  var ts = fso.OpenTextFile(path, 1);
  text = ts.readAll();
  ts.close();
  return text;
}

//
function writeFile(path, text) {
  var fso = WScript.CreateObject("Scripting.FileSystemObject");
  var ts = fso.CreateTextFile(path);
  ts.Write(text);
  ts.Close();
}

//
function getWmiProcess(pid, counters) {
  var wmi = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2");
  var wql = "select " + counters +" from Win32_PerfRawData_PerfProc_Process where IDProcess=" + pid;
  for (var e = new Enumerator(wmi.ExecQuery(wql)); !e.atEnd(); e.moveNext())
    return e.item();
}

//
function getPidByName(wpname) {
  var RE = /WP "(\d+)" \([^:]+:([^\)]+)\)/
  var WshShell = WScript.CreateObject("WScript.Shell");
  var oExec = WshShell.Exec("%windir%\\system32\\inetsrv\\appcmd.exe list wp");
  while (!oExec.StdOut.AtEndOfStream) {
    var line = oExec.StdOut.ReadLine();
    var match = RE.exec(line)
    if (match && match[2] == wpname)
      return match[1];
  }
}
