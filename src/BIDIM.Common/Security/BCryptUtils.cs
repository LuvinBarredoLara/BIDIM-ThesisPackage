using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;

namespace BIDIM.Common.Security
{
    public static class BCryptUtils
    {
        const string EncryptionSalt = "E460FF94-8F38-478F-9D8B-E06FE3257F77";
        const int EncryptionWorkFactor = 10;

        public static string HashPassword(string rawPW)
        {
            string retVal = string.Empty;

            try
            {
                // Append salt
                rawPW = $"{EncryptionSalt}{rawPW}{EncryptionSalt}";

                retVal = BCrypt.Net.BCrypt.HashPassword(rawPW, EncryptionWorkFactor);
            }
            catch (Exception ex)
            {
                ex = new Exception("Error at BCrypt.BCryptUtils.HashPassword" + Environment.NewLine + ex.Message);

                throw ex;
            }

            return retVal;
        }

        public static bool PasswordMatches(string rawPW, string hashedPW)
        {
            bool retVal = false;

            try
            {
                // Append salt
                rawPW = $"{EncryptionSalt}{rawPW}{EncryptionSalt}";

                retVal = BCrypt.Net.BCrypt.Verify(rawPW, hashedPW);
            }
            catch (Exception ex)
            {
                ex = new Exception("Error at BCrypt.BCryptUtils.PasswordMatches" + Environment.NewLine + ex.Message);

                throw ex;
            }

            return retVal;
        }
    }
}
