import Utility from './utility';
import API from './api';


const utility = Utility();
utility.setCurrentTime();
utility.toggleNav('nav-table-tabs');
utility.toggleNav('nav-chart-tabs');
utility.slideshow();
utility.getCityOnInput();
utility.populateSearchValue();
utility.closeErrorMsg();
utility.toggleNavPages();

const api = API();
api.makeCall();
api.loadCurrentLoc();