

-- UserTypes Trigger --
GO
CREATE TRIGGER dbo.UserTypes_Audit ON dbo.UserTypes
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF(EXISTS(SELECT * FROM inserted))
    BEGIN
        -- Update
        IF(EXISTS(SELECT * FROM deleted))
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'UserType.Id',
                        i.Name AS 'UserType.Name',
                        i.IsActive AS 'UserType.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'UPDATE',
                'UserTypes',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
        -- Insert
        ELSE
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'UserType.Id',
                        i.Name AS 'UserType.Name',
                        i.IsActive AS 'UserType.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'INSERT',
                'UserTypes',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
    END;
END;

-- Users Trigger
GO
CREATE TRIGGER dbo.Users_Audit ON dbo.Users
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF(EXISTS(SELECT * FROM inserted))
    BEGIN
        -- Update
        IF(EXISTS(SELECT * FROM deleted))
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'User.Id',
                        i.FirstName AS 'User.FirstName',
                        i.LastName AS 'User.LastName',
                        i.PasswordHash AS 'User.PasswordHash',
                        i.IsActive AS 'User.IsActive',
                        i.UserTypeId AS 'User.UserTypeId'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'UPDATE',
                'Users',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
        ELSE
        -- Insert
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (SELECT
                    i.Id AS 'User.Id',
                    i.FirstName AS 'User.FirstName',
                    i.LastName AS 'User.LastName',
                    i.PasswordHash AS 'User.PasswordHash',
                    i.IsActive AS 'User.IsActive',
                    i.UserTypeId AS 'User.UserTypeId'
                FOR JSON PATH, INCLUDE_NULL_VALUES),
                'INSERT',
                'Users',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
    END;
END;

-- Household Trigger
GO
CREATE TRIGGER dbo.Households_Audit ON dbo.Households
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF(EXISTS(SELECT * FROM inserted))
    BEGIN
        -- Update
        IF(EXISTS(SELECT * FROM deleted))
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'Household.Id',
						i.FamilyName AS 'Household.FamilyName',
                        i.CityMun AS 'Household.CityMun',
                        i.Brgy AS 'Household.Brgy',
                        i.[Zone] AS 'Household.Zone',
						i.Street AS 'Household.Street',
                        i.Long AS 'Household.Long',
                        i.Lat AS 'Household.Lat',
                        i.IsActive AS 'Household.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'UPDATE',
                'Households',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
        -- Insert
        ELSE
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'Household.Id',
                        i.CityMun AS 'Household.CityMun',
                        i.Brgy AS 'Household.Brgy',
                        i.[Zone] AS 'Household.Zone',
                        i.Long AS 'Household.Long',
                        i.Lat AS 'Household.Lat',
                        i.IsActive AS 'Household.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'INSERT',
                'Households',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
    END;
END;

-- Individual Trigger
GO
CREATE TRIGGER dbo.Individual_Audit ON dbo.Individuals
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF(EXISTS(SELECT * FROM inserted))
    BEGIN
        -- Update
        IF(EXISTS(SELECT * FROM deleted))
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'Individual.Id',
                        i.FirstName AS 'Individual.FirstName',
						i.LastName AS 'Individial.LastName',
						i.DoB AS 'Individial.DoB',
						i.Age AS 'Individial.Age',
						i.Gender AS 'Individial.Gender',
						i.ContactNumber AS 'Individial.ContactNumber',
						i.HouseholdId AS 'Individial.HouseholdId',
						i.IsActive AS 'Individial.IsActive',
						i.IsDeceasedByDisease AS 'Individial.IsDeceasedByDisease'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'UPDATE',
                'Individual',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
        -- Insert
        ELSE
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'Individual.Id',
                        i.FirstName AS 'Individual.FirstName',
						i.LastName AS 'Individial.LastName',
						i.DoB AS 'Individial.DoB',
						i.Age AS 'Individial.Age',
						i.Gender AS 'Individial.Gender',
						i.ContactNumber AS 'Individial.ContactNumber',
						i.HouseholdId AS 'Individial.HouseholdId',
						i.IsActive AS 'Individial.IsActive',
						i.IsDeceasedByDisease AS 'Individial.IsDeceasedByDisease'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'INSERT',
                'Individual',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
    END;
END;

-- Case Trigger
GO
CREATE TRIGGER dbo.Case_Audit ON dbo.Cases
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF(EXISTS(SELECT * FROM inserted))
    BEGIN
        -- Update
        IF(EXISTS(SELECT * FROM deleted))
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
						i.[Guid] AS 'Case.Guid',
                        i.Id AS 'Case.Id',
						i.CreatedDate AS 'Case.CreatedDate',
						i.Outcome AS 'Case.Outcome',
						i.OutcomeDate AS 'Case.OutcomDate',
						i.IndividualId AS 'Case.IndividualId',
						i.InfectiousDiseaseId AS 'Case.InfectiousDiseaseId',
						i.IsActive AS 'Case.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'UPDATE',
                'Cases',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
        -- Insert
        ELSE
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.[Guid] AS 'Case.Guid',
                        i.Id AS 'Case.Id',
						i.CreatedDate AS 'Case.CreatedDate',
						i.Outcome AS 'Case.Outcome',
						i.OutcomeDate AS 'Case.OutcomDate',
						i.IndividualId AS 'Case.IndividualId',
						i.InfectiousDiseaseId AS 'Case.InfectiousDiseaseId',
						i.IsActive AS 'Case.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'INSERT',
                'Cases',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
    END;
END;

-- InfectiousDisease Trigger
GO
CREATE TRIGGER dbo.InfectiousDisease_Audit ON dbo.InfectiousDiseases
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF(EXISTS(SELECT * FROM inserted))
    BEGIN
        -- Update
        IF(EXISTS(SELECT * FROM deleted))
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'InfectiousDisease.Id',
                        i.Name AS 'InfectiousDisease.Name',
                        i.IsActive AS 'InfectiousDisease.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'UPDATE',
                'InfectiousDiseases',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
        -- Insert
        ELSE
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'InfectiousDisease.Id',
                        i.Name AS 'InfectiousDisease.Name',
                        i.IsActive AS 'InfectiousDisease.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'INSERT',
                'InfectiousDiseases',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
    END;
END;

-- CaseMonitoring Trigger
GO
CREATE TRIGGER dbo.CaseMonitoring_Audit ON dbo.CaseMonitorings
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF(EXISTS(SELECT * FROM inserted))
    BEGIN
        -- Update
        IF(EXISTS(SELECT * FROM deleted))
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'CaseMonitoring.Id',
						i.Symptoms AS 'CaseMonitoring.Symptoms',
						i.Remarks AS 'CaseMonitoring.Remarks',
						i.CreatedDate AS 'CaseMonitoring.CreatedDate',
						i.CaseId AS 'CaseMonitoring.CaseId',
						i.[Status] AS 'CaseMonitoring.Status',
						i.IsActive AS 'CaseMonitoring.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'UPDATE',
                'CaseMonitorings',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
        -- Insert
        ELSE
        BEGIN
            INSERT INTO dbo.AuditLogs
            (
                Id,
                ObjectId,
                ObjectData,
                Operation,
                Module,
                AuditDate,
                AuditName
            )
            SELECT
                NEWID(),
                CAST(i.Id AS VARCHAR(128)),
                (
                    SELECT
                        i.Id AS 'CaseMonitoring.Id',
						i.Symptoms AS 'CaseMonitoring.Symptoms',
						i.Remarks AS 'CaseMonitoring.Remarks',
						i.CreatedDate AS 'CaseMonitoring.CreatedDate',
						i.CaseId AS 'CaseMonitoring.CaseId',
						i.[Status] AS 'CaseMonitoring.Status',
						i.IsActive AS 'CaseMonitoring.IsActive'
                    FOR JSON PATH, INCLUDE_NULL_VALUES
                ),
                'INSERT',
                'CaseMonitorings',
                GETUTCDATE(),
                'SYSTEM'
            FROM
                inserted AS i;
        END;
    END;
END;