### Backup Module

The plan is to implement an endpoint that can extract the
data from elasticsearch.

Data will be small in total... likely under 1MB.

Also, consider a cron job in this module to do rolling backups
on the file system.

Consider exporting these backups to Google drive.