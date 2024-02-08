using BIDIM.Common;
using BIDIM.Common.Models;
using BIDIM.Common.Security;
using Main.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BIDIM.WebApi.Controllers
{
    [Route("Individual")]
    [Authorize]
    [ApiController]
    public class IndividualController : ApiBaseController
    {
        protected readonly IMainService _mainService;

        public IndividualController(IMainService mainService)
        {
            _mainService = mainService;
        }

        [HttpGet]
        [Route("~/Individuals")]
        public async Task<ActionResult> GetList()
        {
            var retVal = await _mainService.GetIndividualList();

            return OkJsonResult("", retVal);
        }

        [HttpGet]
        [Route("~/Individuals/DropdownList")]
        public async Task<ActionResult> GetDropdownList()
        {
            var retVal = await _mainService.GetIndividualDropdownList();

            return OkJsonResult("", retVal);
        }

        [HttpGet]
        [Route("{Id}")]
        public async Task<ActionResult> GetIndividual(Guid Id)
        {
            var retVal = await _mainService.GetIndividualById(Id);

            if (retVal is null)
                return ErrorJsonResult("Individual not found", StatusCodes.Status404NotFound);

            return OkJsonResult("", retVal);
        }

        [HttpPost]
        public async Task<ActionResult> Upsert([FromBody] IndividualViewModel model)
        {
            var retVal = await _mainService.UpsertIndividual(model);

            return OkJsonResult("", retVal);
        }
    }
}
