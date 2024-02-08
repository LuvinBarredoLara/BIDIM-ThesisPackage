using BIDIM.Common.Models;
using BIDIM.Domain.Interfaces;
using Status.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Status.Server
{
    public class StatusService : IStatusService
    {
        protected readonly IStatusRepository _statusRepository;

        public StatusService(IStatusRepository statusRepository)
        {
            _statusRepository = statusRepository;
        }

        public async Task<List<StatusDropdown>> GetAllActive()
        {
            List<StatusDropdown> retVal = new List<StatusDropdown>();

            var statuses = await _statusRepository.GetAllActive();

            if (statuses.Any())
                statuses.ForEach(s => retVal.Add(s.ToDropdown()));

            return retVal;
        }
    }

    internal static class StatusExtension
    {
        internal static StatusDropdown ToDropdown(this BIDIM.Domain.Models.Status model)
        {
            if (model is null)
                throw new NullReferenceException($"{nameof(model)} cannot be null");

            return new StatusDropdown()
            {
                Id = model.Id,
                Name = model.Name
            };
        }
    }
}
