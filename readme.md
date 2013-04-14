Zabbix IIS 7 Worker Process Template
====================================

Zabbix open source monitoring solution allow create templates for specific applications.

Zabbix Windows OS templates usually are combination from built-in performance counters
with a reference to process name and optionaly PID.

Monitoring IIS is little bit tricky because working processes is created and recycled in
various conditions and thus change their PID numbers or gone forever.

Solution
--------

Use Zabbix Low-level discovery feature to find IIS 7 application pool names using *appcmd.exe*.

Use WMI script for specified application name to find the PID and then the required performance counter.

Installation
------------

Copy files to Zabbix Agent directory (C:\Program Files\Zabbix\w3wp-wmi.js)

  *   w3wp.conf
  *   w3wp-discovery.js
  *   w3wp-wmi.js

Append Zabbix Agent configuration file (zabbix_agentd.conf) with lines from file *w3wp.conf*
or *Include* file.

Import Zabbix template (iis-w3wp.xml) and assign to a Windows IIS host.


