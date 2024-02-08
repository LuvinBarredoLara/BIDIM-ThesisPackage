

-- Run against master db to create auth login

-- Create login 
CREATE LOGIN sqlrwlogin WITH password='*!rwus3r!*';
GO
-- Create user for login above
CREATE USER sqlrwuser FOR LOGIN sqlrwlogin WITH DEFAULT_SCHEMA=[dbo];
GO


-- Run against client db and map to a login

-- Create user and map to login that was run to the master db
CREATE USER sqlrwuser FOR LOGIN sqlrwlogin WITH DEFAULT_SCHEMA=[dbo];
GO
-- Finally add the user to the role
EXEC sp_addrolemember 'db_datareader', 'sqlrwuser';
GO
EXEC sp_addrolemember 'db_datawriter', 'sqlrwuser';
GO
EXEC sp_addrolemember 'db_ddladmin', 'sqlrwuser'
GO
GRANT EXEC ON SCHEMA :: dbo TO sqlrwuser;
GO