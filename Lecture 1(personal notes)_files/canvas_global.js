/*####EvaluationKIT START####*/
var evalkit_jshosted = document.createElement('script');
evalkit_jshosted.setAttribute('type', 'text/javascript');
evalkit_jshosted.setAttribute('src', 'https://emory.evaluationkit.com/CanvasScripts/emory.js?v=9');
document.getElementsByTagName('head')[0].appendChild(evalkit_jshosted);
/*####EvaluationKIT END####*/

/*####Google Analytics####*/
//Working as of Aug 28, 2019
// Updated Aug 28, 2019
// In Google Analytics you'll need to set up custom dimensions as follows
// Custom Dimension 1 = Canvas User ID --- Scope = User
// Custom Dimension 2 = Archived --- Scope = User
// Custom Dimension 3 = Canvas User Role --- Scope = User
// Custom Dimension 4 = Canvas Course ID --- Scope = Hit
// Custom Dimension 5 = Canvas Course Name --- Scope = Hit
// Custom Dimension 6 = Canvas Sub-Account ID --- Scope = Hit
// Custom Dimension 7 = Canvas Term ID --- = Scope = Hit
// Custom Dimension 8 = Canvas Course Role --- Scope = Hit

(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'custom_ga');

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(key + '_expiresIn');
  } catch (e) {
    console.log('removeStorage: Error removing key [' + key + '] from localStorage: ' + JSON.stringify(e));
    return false;
  }
  return true;
}

function getStorage(key) {
  var now = Date.now(); //epoch time, lets deal only with integer
  // set expiration for storage
  var expiresIn = localStorage.getItem(key + '_expiresIn');
  if (expiresIn === undefined || expiresIn === null) {
    expiresIn = 0;
  }

  if (expiresIn < now) { // Expired
    removeStorage(key);
    return null;
  } else {
    try {
      var value = localStorage.getItem(key);
      return value;
    } catch (e) {
      console.log('getStorage: Error reading key [' + key + '] from localStorage: ' + JSON.stringify(e));
      return null;
    }
  }
}

function setStorage(key, value, expires) {
  if (expires === undefined || expires === null) {
    expires = (24 * 60 * 60); // default: seconds for 6 hours (6*60*60)
  } else {
    expires = Math.abs(expires); //make sure it's positive
  }

  var now = Date.now(); //millisecs since epoch time, lets deal only with integer
  var schedule = now + expires * 1000;
  try {
    localStorage.setItem(key, value);
    localStorage.setItem(key + '_expiresIn', schedule);
  } catch (e) {
    console.log('setStorage: Error setting key [' + key + '] in localStorage: ' + JSON.stringify(e));
    return false;
  }
  return true;
}

async function coursesRequest(courseId) {
  //
  let response = await fetch('/api/v1/users/self/courses?per_page=100');
  let data = await response.text();
  data = data.substr(9);
  data = JSON.parse(data)
  var stringData = JSON.stringify(data)
  setStorage('ga_enrollments', stringData, null)
  var course = parseCourses(courseId, stringData)
  return course
};

function parseCourses(courseId, courseData) {
  if (courseData != undefined) {
    let data = JSON.parse(courseData);
    //console.log(data)
    for (var i = 0; i < data.length; i++) {
      // console.log(data[i]['id'] + " " + courseId)
      if (data[i]['id'] == courseId) {
        return data[i]
      }
    }
  }
  return null
}

function gaCourseDimensions(course) {
  custom_ga('set', 'dimension4', course['id']);
  custom_ga('set', 'dimension5', course['name']);
  custom_ga('set', 'dimension6', course['account_id']);
  custom_ga('set', 'dimension7', course['enrollment_term_id']);
  custom_ga('set', 'dimension8', course['enrollments'][0]['type']);
  custom_ga('send', 'pageview');
  return
}

function googleAnalyticsCode(trackingID) {
  var userId, userRoles, attempts, courseId;
  custom_ga('create', trackingID, 'auto');
  userId = ENV["current_user_id"];
  userRoles = ENV['current_user_roles'];
  custom_ga('set', 'userId', userId);
  custom_ga('set', 'dimension1', userId);
  custom_ga('set', 'dimension3', userRoles);
  courseId = window.location.pathname.match(/\/courses\/(\d+)/);
  if (courseId) {
    courseId = courseId[1];
    attempts = 0;
    try {
      let courses = getStorage('ga_enrollments')
      if (courses != null) {
        var course = parseCourses(courseId, courses);
        if (course === null) {
          // console.log("course_id not found in cache, retrieving...")
          coursesRequest(courseId).then(course => {
            if (course === null) {
              // console.log("course data not found")
              custom_ga('set', 'dimension4', courseId);
              custom_ga('send', 'pageview');
            } else {
              gaCourseDimensions(course)
            }
          });
        } else {
          // console.log("course found in cache")
          gaCourseDimensions(course)
        }
      } else {
        // console.log("cache not found, retrieving cache data")
        coursesRequest(courseId).then(course => {
          if (course === null) {
            // console.log("course data not found")
            custom_ga('set', 'dimension4', courseId);
            custom_ga('send', 'pageview');
          } else {
            gaCourseDimensions(course)
          }
        });
      }
    } catch (err) {
      attempts += 1;
      if (attempts > 5) {
        custom_ga('set', 'dimension4', courseId);
        custom_ga('send', 'pageview');
        return;
      };
    };
  } else {
    custom_ga('send', 'pageview');
  };
};

googleAnalyticsCode("UA-49222326-4");
/*####End Google####*/

/*####Hide Specific Settings####*/
function hide_settings() {
  /*####NOTES:
  We may not need to hide all of these but will discuss internally.
  Edit section button: edit section button doesn't appear next to sections that have SIS IDs.
  Delete sections button: delete section button doesn't appear next to courses that have users enrolled.
    Instead an icon stating 'you can't delete sections that have users enrolled' appears
  Delete course button: doesn't appear if the course has an SIS ID.
    ####*/
  /*Pure JavaScript implementation of hiding icons. It queries for an item
  and modifies it's CSS display property to hide it*/
  sectionLinks = document.querySelectorAll("[class='section_links']");
  for (i=0; i<sectionLinks.length; i++) { //
    sectionLinks[i].style.display = "none"; //hide all section like items (edit section & delete section in course settings)
  }
  document.querySelector("#add_section_form").style.display = "none";
  //hide add section form
}
/*DOMContentLoaded sometimes executes before all buttons exist so we use 'load'.
There's a visible change when hiding items, but it always works. */
window.addEventListener('load', () => {
if (/courses\/[0-9]+\/settings/.test(window.location.pathname) && !['118134','209764','179377','118143','118135','118140','118138','134127','118141','118142','118132','118137','118136'].includes(ENV['current_user_id'])) {
    hide_settings();
};
if (/courses\/[0-9]+\/details/.test(window.location.pathname) && !['118134','209764','179377','118143','118135','118140','118138','134127','118141','118142','118132','118137','118136'].includes(ENV['current_user_id'])) { //details page is loaded when a user clicks 'Save' on the navigation page under course settings.
  hide_settings();
};
if (/courses\/[0-9]+\/sections/.test(window.location.pathname) && !['118134','209764','179377','118143','118135','118140','118138','134127','118141','118142','118132','118137','118136'].includes(ENV['current_user_id'])) {
  try {
    document.querySelector("a.btn.button-sidebar-wide.uncrosslist_link").style.display = "none";
    //hide 'de-cross-list this section' button
  }
  catch (err) { console.log("No de-cross-list section button detected") }
};
if (/profile\/settings/.test(window.location.pathname)) {
      document.querySelector("i[title='Set email address as default']").style.display = "none";
      //hides default email icon under user account settings.
};
/*####End Hide Specific Settings####*/

/*####Sidebar Coloring for Canvas Instances####*/
if ((/canvas-beta.emory.edu*/.test(window.location.href)) || (/emory.beta.instructure.com*/.test(window.location.href))) {
  document.querySelector("div.ic-app-header__main-navigation").style.backgroundColor = "pink"
  //sets nav bar color to pink on canvas beta instance.
};
if ((/canvas-test.emory.edu*/.test(window.location.href)) || (/emory.test.instructure.com*/.test(window.location.href))) {
  document.querySelector("div.ic-app-header__main-navigation").style.backgroundColor = "black"
  //sets nav bar color to black on canvas test instance.
};
});
/*####End Sidebar Coloring for Canvas Instances####*/

////////////////////////////////////////////////////
// DESIGN TOOLS CONFIG                            //
////////////////////////////////////////////////////
// Copyright (C) 2017  Utah State University
var DT_variables = {
        iframeID: '',
        // Path to the hosted USU Design Tools
        path: 'https://designtools.ciditools.com/',
        templateCourse: '79437',
        // OPTIONAL: Button will be hidden from view until launched using shortcut keys
        hideButton: true,
    	 // OPTIONAL: Limit by course format
	     limitByFormat: false, // Change to true to limit by format
	     // adjust the formats as needed. Format must be set for the course and in this array for tools to load
	     formatArray: [
            'online',
            'on-campus',
            'blended'
        ],
        // OPTIONAL: Limit tools loading by users role
        limitByRole: false, // set to true to limit to roles in the roleArray
        // adjust roles as needed
        roleArray: [
            'student',
            'teacher',
            'admin'
        ],
        // OPTIONAL: Limit tools to an array of Canvas user IDs
        limitByUser: false, // Change to true to limit by user
        // add users to array (Canvas user ID not SIS user ID)
        userArray: [
            '1234',
            '987654'
        ]
};

// Run the necessary code when a page loads
$(document).ready(function () {
    'use strict';
    // This runs code that looks at each page and determines what controls to create
    $.getScript(DT_variables.path + 'js/master_controls.js', function () {
        console.log('master_controls.js loaded');
    });
});
////////////////////////////////////////////////////
// END DESIGN TOOLS CONFIG                        //
////////////////////////////////////////////////////
