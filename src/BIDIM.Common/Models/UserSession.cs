
using Newtonsoft.Json;

namespace BIDIM.Common.Models
{
    [Serializable]
    public class UserSession
    {
        [JsonIgnore]
        public Guid ID { get; set; }

        public string Username { get; set; }

        public string Firstname { get; set; }

        public string Lastname { get; set; }

        public string Type { get; set; }

        public string Token { get; set; }
    }
}
