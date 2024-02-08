using BIDIM.Common.Models;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;
using Disease.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disease.Server
{
    public class InfectiousDiseaseService : IInfectiousDiseaseService
    {
        protected readonly IInfectiousDiseaseRepository _infectiousDiseaseRepository;

        public InfectiousDiseaseService(IInfectiousDiseaseRepository infectiousDiseaseRepository)
        {
            _infectiousDiseaseRepository = infectiousDiseaseRepository;
        }

        public async Task<List<InfectiousDiseaseDropdown>> GetAllActive()
        {
            List<InfectiousDiseaseDropdown> retVal = new List<InfectiousDiseaseDropdown>();

            List<InfectiousDisease> diseases = await _infectiousDiseaseRepository.GetAllActive();

            if (diseases.Any())
                diseases.ForEach(d => retVal.Add(d.ToDropdown()));

            return retVal;
        }
    }

    internal static class InfectiousDiseaseExtension
    {
        internal static InfectiousDiseaseDropdown ToDropdown(this InfectiousDisease model)
        {
            if (model is null)
                throw new NullReferenceException($"{nameof(model)} cannot be null");

            return new InfectiousDiseaseDropdown()
            {
                Id = model.Id,
                Name = model.Name
            };
        }

    }
}
