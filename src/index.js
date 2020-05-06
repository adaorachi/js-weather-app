import Utility from './utility';
import API from './api';


const utility = Utility();
utility.setCurrentTime();
utility.getCityOnInput();
utility.populateSearchValue();
utility.closeErrorMsg();
utility.toggleNavPages();
utility.backButton();
utility.deleteAddLocTab();

const api = API();
api.makeAPICall();
api.getCurrentLocationOnLoad();
api.callAPIOnTempToggle();
api.addFavLocAPICall();