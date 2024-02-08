

IF OBJECT_ID(N'AuditLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs
    (
        Id					UNIQUEIDENTIFIER PRIMARY KEY NONCLUSTERED DEFAULT NEWSEQUENTIALID() NOT NULL,
		ObjectId			VARCHAR(128),
		ObjectData			NVARCHAR(MAX),
		Operation			VARCHAR(128),
		Module				VARCHAR(128),
		AuditDate			DATETIME,
		AuditName			VARCHAR(128),
    );
    CREATE CLUSTERED INDEX auditLog_Id_Index ON dbo.AuditLogs(Id);
END;