using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Pnw.Model;

namespace Pnw.Admin.Models
{
    public class BootstrapVm
    {
        public BootstrapVm()
        {
            _serializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
        }

        private readonly JsonSerializerSettings _serializerSettings;

        public User User { get; set; }
        public League DefaultLeague { get; set; }
        public Season DefaultSeason { get; set; }
        public DateTime CurrentDate { get; set; }

        public string UserJSON
        {
            get
            {
                var defaultLeague = JsonConvert.SerializeObject(User, _serializerSettings);
                return defaultLeague;
            }
        }

        public string DefaultLeagueJSON
        {
            get
            {
                var defaultLeague = JsonConvert.SerializeObject(DefaultLeague, _serializerSettings);
                return defaultLeague;
            }
        }

        public string DefaultSeasonJSON
        {
            get
            {
                var defaultSeason = JsonConvert.SerializeObject(DefaultSeason, _serializerSettings);
                return defaultSeason;
            }
        }

        public string CurrentDateJson
        {
            get
            {
                var defaultCurrentDate = JsonConvert.SerializeObject(CurrentDate, _serializerSettings);
                return defaultCurrentDate;
            }
        }
    }
}