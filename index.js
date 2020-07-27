const server_address = "127.0.0.1:3000";
const socket = io(server_address);
let _events = {};

function send() {
  sendData("send_message", document.getElementById("input-message").value);
  document.getElementById("input-message").value = "";
}

function disconnect() {
  sendData("leave_channel");
}

function showChannels() {
  document.getElementsByClassName("page-channels")[0].classList.remove("hide")
  document.getElementsByClassName("page-loading")[0].classList.add("hide")
  document.getElementsByClassName("page-messages")[0].classList.add("hide")
  sendData("get_channels_list");
}

function showMessages() {
  document.getElementsByClassName("page-channels")[0].classList.add("hide")
  document.getElementsByClassName("page-loading")[0].classList.add("hide")
  document.getElementsByClassName("page-messages")[0].classList.remove("hide")
  $(".messages button").remove()
}

_events["connect_success"] = data => {
  setCookie("chatUID", data.id, 365);
  showChannels();
}

_events["join_channel_success"] = () => {
  showMessages();
}

_events["join_channel_failed"] = () => {
  showChannels();
}

_events["leave_channel_success"] = () => {
  showChannels();
}

_events["channels_list"] = data => {
  setChannelsList(data.channels)
}

_events[":"] = data => {
  console.log(data)
}

_events["add_message"] = add => {

  var message = add.message;

  var button = $(`<button type="button" class="list-group-item list-group-item-action">${(message.text)}</button>`);
  button.attr("id", "msg-"+message.id);

  if(add.after) {
    $("#msg-"+add.after).after(button);
  } else {
    $(".messages").prepend(button);
  }


}

_events["remove_message"] = id => {
  $("#msg-"+id).remove();
}

setChannelsList = function(channels) {
  $(".channels button").remove()

  var createButton = function(channel) {
    var button = $(`<button type="button" class="list-group-item list-group-item-action">[${channel.id}] ( ${channel.usersCount} / ${channel.maxUsers} ) ${channel.name}</button>`);

    button.click(() => {
      sendData("join_channel", {channelId: channel.id});
    })

    $(".channels").append(button);

  }

  for (var channel of channels) {
    createButton(channel);
  }
}

socket.on("connect", function() { sendData("join", {uid: getCookie("chatUID")}); })
socket.on("data", es => { for (var e of es) { console.log(e.id); _events[ _events[e.id] ? e.id : ":"].apply(null, [e.data]) } });

function sendData(id, data) { socket.emit("data", {id: id, data: data || {}}) }











function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
