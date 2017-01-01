var socket = io();
var localStatus = false;

function GetUserRowNameHTML(localSocketId, userInfo) {
  var sanitizedName = $($.parseHTML(userInfo.name)).text()
  var nameHTML = "";
  if (userInfo.id == localSocketId) {
    nameHTML += "<input type=\"name\" class=\"form-control input-lg\" id=\"nameInput\" placeholder=\"Name\" value=\"" + sanitizedName + "\">";
  }
  else {
    nameHTML += sanitizedName;
  }
  return nameHTML;
}

function GetUserRowVoteHTML(localSocketId, userInfo) {
  var sanitizedVote = $($.parseHTML(userInfo.vote)).text()
  var voteHTML = "";
  if (userInfo.id == localSocketId) {
    voteHTML += "<input type=\"vote\" class=\"form-control input-lg\" id=\"voteInput\"  placeholder=\"Vote\" value=\"" + sanitizedVote + "\">";
  }
  else {
    voteHTML += sanitizedVote;
  }
  return voteHTML;
}

function GetUserRowStatusHTML(localSocketId, userInfo) {
  var statusHTML = "";
  if (userInfo.id == localSocketId) {
    if (userInfo.status) {
      statusHTML += "<button id=\"statusButton\" type=\"button\" class=\"btn btn-success btn-lg\">Ready</button>";
    }
    else {
      statusHTML += "<button id=\"statusButton\" type=\"button\" class=\"btn btn-danger btn-lg\">Not Ready</button>";
    }
  }
  else {
    if (userInfo.status) {
      statusHTML += "<span class=\"label label-success\">Ready</span>";
    }
    else {
      statusHTML += "<span class=\"label label-danger\">Not Ready</span>";
    }
  }
  return statusHTML;
}

function GetUserRowClassName(localSocketId, userInfo) {
  var className = "";
  if (userInfo.id == localSocketId) {
    className += "userRowLocal";
  }
  else {
    className += "userRowRemote";
  }
  return className;
}

function GetUserRowHTML(localSocketId, userInfo) {
  var tableRowHTML = "<tr class=\"" + GetUserRowClassName(localSocketId, userInfo) + "\" id=\"" + userInfo.id + "\">";
  
  tableRowHTML += "<td class=\"col-md-4\">" + GetUserRowNameHTML(localSocketId, userInfo) + "</td>" +
    "<td class=\"col-md-6\">" + GetUserRowVoteHTML(localSocketId, userInfo) + "</td>" +
    "<td class=\"col-md-2\">" + GetUserRowStatusHTML(localSocketId, userInfo) + "</td>";
    
  tableRowHTML += "</tr>";
  return tableRowHTML;
}

function UpdateUserInfo(localSocketId, userInfos) {
  // Add local user row if it doesn't exist
  if ($("#" + localSocketId).length == 0) {
    $("#usersTable tbody").append(GetUserRowHTML(localSocketId, userInfos[localSocketId]));
    $("#statusButton").click(onStatusButtonClicked);
    $('#nameInput').on('input', onNameTextInput);
    $('#voteInput').on('input', onVoteTextInput);
  }
  
  // Update local status
  localStatus = userInfos[localSocketId].status;
  
  // Remove/update existing rows
  var rowExists = {};
  $( "tr.userRowRemote" ).each(function( index ) {
    var id = $(this).attr('id');
      if (id in userInfos) {
        if (userInfos[id].name == "") {
          $(this).remove();
        }
        else {
          $(this).replaceWith(GetUserRowHTML(localSocketId, userInfos[id]));
          rowExists[id] = true;
        }
      }
      else {
        $(this).remove();
      }
  });
  
  // Add new rows
  Object.keys(userInfos).forEach(function (id) {
    if (!(id in rowExists) && id != localSocketId && userInfos[id].name != "") {
      $("#usersTable tbody").append(GetUserRowHTML(localSocketId, userInfos[id]));
    }
  });
  
  // Update progress bar
  var numTotal = 0;
  var numReady = 0;
  Object.keys(userInfos).forEach(function (id) {
    if (userInfos[id].name != "") {
      numTotal++;
      if (userInfos[id].status) {
        numReady++;
      }
    }
  });
  
  var percent = 0;
  if (numTotal > 0) {
    percent = (numReady / numTotal) * 100;
  }
  
  $(".progress-bar").width(percent.toString() + "%");
  if (percent == 100) {
    $(".progress-bar").removeClass("progress-bar-info");
    $(".progress-bar").addClass("progress-bar-success");
    $("#readyText").text(numReady.toString() + "/" + numTotal.toString() + " Ready - Let's go! Meet in the upstairs lobby!");
  }
  else {
    $(".progress-bar").removeClass("progress-bar-success");
    $(".progress-bar").addClass("progress-bar-info");
    if (numTotal > 0) {
      $("#readyText").text(numReady.toString() + "/" + numTotal.toString() + " Ready");
    }
    else {
      $("#readyText").text("0/0 Ready");
    }
  }
}

function onNameTextInput()
{
  socket.emit('updateName', $("#nameInput").val());
}

function onVoteTextInput()
{
  socket.emit('updateVote', $("#voteInput").val());
}

function onStatusButtonClicked()
{
 if ($("#statusButton").hasClass("btn-danger")) {
  $("#statusButton").removeClass("btn-danger");
  $("#statusButton").addClass("btn-success");
  $("#statusButton").text("Ready");
  localStatus = true;
 }
 else {
   $("#statusButton").removeClass("btn-successs");
   $("#statusButton").addClass("btn-danger");
   $("#statusButton").text("Not Ready");
   localStatus = false;
 }
 socket.emit('updateStatus', localStatus);
}

socket.on('users', function(users) {
  UpdateUserInfo(socket.id, users);
});