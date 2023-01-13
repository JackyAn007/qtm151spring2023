/*####People Tool & Edit Role Changes####*/
function roleFix() {
  document.getElementById('peoplesearch_select_role').value = "Select One..."; //remove student role from add users.
}

function addPeopleMagic() {
  $("[value='3']").remove(); //remove student role from list.
  $("[value='4']").remove(); //remove Teacher role
  $("[value='5']").remove(); //remove TA role
  $("[value='63']").remove(); //remove Grade Proxy role
}

function addPeopleFixer(el) {
  var observer = new MutationObserver(fixing)
  observer.observe(el, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-activedescendant', 'value']
  })
  $("#addpeople_next").hide(); //hide Next button.
  roleFix();

  function fixing(mutations, observer) {
    mutations.forEach(function(mutation) {
      addPeopleMagic();
      //console.log(mutations)
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].target.id === 'peoplesearch_select_role' && mutations[i].target.defaultValue != 'Student' && mutations[i].target.defaultValue != 'Teacher') {
          selected = true;
          $("#addpeople_next").show(); //reveal Next button.
        }
      }
      if ($("#addpeople_next").is(":hidden")) {
        roleFix()
      }
      for (var i = 0; i < mutation.removedNodes.length; i++) {
        if (mutation.removedNodes[i].id == 'addpeople_back' && mutation.removedNodes[i].innerText == 'Start Over') {
          //console.log('Start over');
          $("#addpeople_next").hide(); //hide Next button.
          roleFix();
        }
      }
    })
  }
}

function waitForAddedNode(params) {
  var state = true
  var el = document.getElementById(params.id);
  if (el && params.location == 'course') {
    params.done(el)
  }
  new MutationObserver(function(mutations) {
    if (params.location == "account") {
      var el = document.getElementById(params.id);
      if (el && state) {
        state = false
        params.done(el);
      }
      mutations.forEach(function(mutation) {
        for (var i = 0; i < mutation.removedNodes.length; i++) {
          for (var b = 0; b < mutation.removedNodes[i].childNodes.length; b++) {
            if (mutation.removedNodes[i].childNodes[b].id == params.id) {
              state = true
            }
          }
        }
      })
    }
  }).observe(params.parent, {
    subtree: !!params.recursive,
    childList: true,
  });
}

if (/courses\/[0-9]+\/users/.test(window.location.pathname)) {
  waitForAddedNode({
    id: 'add_people_modal',
    location: 'account',
    parent: document.body,
    recursive: true,
    done: function(el) {
      //console.log(el);
      addPeopleFixer(el);
    }
  });

  window.addEventListener('load', () => {
    $(document).on('click', '[data-event="editRoles"]', function() {
      $("#role_id option[value='3']").remove(); //remove student role from edit user role.
      $("#role_id option[value='4']").remove(); //remove Teacher role
      $("#role_id option[value='5']").remove(); //remove TA role
      $("#role_id option[value='63']").remove(); //remove Grade Proxy role
    });
  });
}

if (/accounts\/[0-9]+/.test(window.location.pathname)) {
  waitForAddedNode({
    id: 'add_people_modal',
    location: 'account',
    parent: document.body,
    recursive: true,
    done: function(el) {
      //console.log(el);
      addPeopleFixer(el);
    }
  });
}
/*####End People Tool & Edit Role Changes####*/
