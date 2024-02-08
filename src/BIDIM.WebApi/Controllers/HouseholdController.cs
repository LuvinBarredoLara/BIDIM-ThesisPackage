using BIDIM.Common;
using BIDIM.Common.Models;
using BIDIM.Common.Security;
using Main.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BIDIM.WebApi.Controllers
{
    [Route("Household")]
    [Authorize]
    [ApiController]
    public class HouseholdController : ApiBaseController
    {
        protected readonly IMainService _mainService;

        public HouseholdController(IMainService mainService)
        {
            _mainService = mainService;
        }

        [HttpGet]
        [Route("~/Households")]
        public async Task<ActionResult> GetList()
        {
            var retVal = await _mainService.GetHouseholdList();

            return OkJsonResult("", retVal);
        }

        [HttpGet]
        [Route("~/Households/Dropdowns")]
        public async Task<ActionResult> GetDropdownList()
        {
            var retVal = await _mainService.GetAllActiveHouseholdsDropdown();

            return OkJsonResult("", retVal);
        }

        [HttpGet]
        [Route("{Id}")]
        public async Task<ActionResult> GetById(int Id)
        {
            HouseholdViewModel retVal = await _mainService.GetHouseholdById(Id);

            if (retVal is null)
                return ErrorJsonResult("Household not found", StatusCodes.Status404NotFound);

            return OkJsonResult("", retVal);
        }

        [HttpPost]
        public async Task<ActionResult> Upsert([FromBody] HouseholdViewModel view)
        {
            if (string.IsNullOrEmpty(view.FamilyName))
                return ErrorJsonResult("Family Name cannot be empty", StatusCodes.Status400BadRequest);

            bool exists = await _mainService.CheckHouseholdFamilyNameExists(view.Id, view.FamilyName);

            if (exists)
                return ErrorJsonResult("Family Name already exists", StatusCodes.Status400BadRequest);

            HouseholdViewModel retVal = await _mainService.UpsertHousehold(view);

            return OkJsonResult("", retVal);
        }
    }
}
