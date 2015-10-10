import isMobile from 'ismobilejs';
import ios from '../ios';
import android from '../android';

function autoSelectTheme() {
  if (isMobile.apple.device) {
    return ios;
  } else if (isMobile.android.device) {
    return android;
  } else {
    return ios;
  }
}

export default autoSelectTheme;
