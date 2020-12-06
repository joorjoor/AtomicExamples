'use strict';

var game = Atomic.game;
var view = game.uiView;
var UI = Atomic.UI;
var UIWindow = Atomic.UIWindow;

var window;
var clientToServerConnection;
var remotePlayerClient;

function closeWindow() {
    if (window)
        window.die();
    window = null;
}

function connectToServer(server) {
    game.createScene2D();

    print(server);

    // Disconnect from master
    Atomic.masterServerClient.disconnectFromMaster();

    Atomic.masterServerClient.connectToServerViaMaster(server.connectionId,
        server.internalIP, server.internalPort,
        server.externalIP, server.externalUDPPort,
        game.scene);
}

exports.init = function(onClose) {

    window = new UIWindow();

    window.settings = Atomic.UI.WINDOW_SETTINGS_TITLEBAR;
    window.text = "Join Server";

    window.load("UI/joinServer.ui.txt");

    var masterServerIP = Atomic.localStorage.getMasterServerIP();
    var masterServerPort = Atomic.localStorage.getMasterServerPort();
    Atomic.masterServerClient.connectToMaster(masterServerIP, masterServerPort);

    Atomic.network.subscribeToEvent("ServerConnected", function(data) {

        print("Client Connected to server!");

        clientToServerConnection = Atomic.network.getServerConnection();

        var node = game.scene.createChild("RemotePlayerClient");
        remotePlayerClient = node.createJSComponent("Components/RemotePlayerClient.js");
        remotePlayerClient.init(clientToServerConnection);

        clientToServerConnection.sendStringMessage('ready');
    });

    // Build select list
    var serverSelect = new Atomic.UISelectList();
    var serverList;

    var lp = new Atomic.UILayoutParams();
    lp.minWidth = 300;
    lp.minHeight = 250;
    lp.maxHeight = 250;
    serverSelect.layoutParams = lp;

    window.setSize(200,350);
    view.addChild(window);
    window.center();

    Atomic.masterServerClient.subscribeToEvent("MasterConnectionReady", function() {
        Atomic.masterServerClient.requestServerListFromMaster();
    });

    Atomic.masterServerClient.subscribeToEvent("MasterServerMessage", function(message) {
        print('In Javascript, MasterServerMessage received');

        var msg = JSON.parse(message['data']);

        if (msg.cmd === 'serverList') {
            serverList = JSON.parse(msg.servers);

            var serverContainer = window.getWidget("servercontainer");
            serverContainer.addChild(serverSelect);

            var serverSelectSource = new Atomic.UISelectItemSource();

            for (var i = 0; i < serverList.length; i++) {
                var server = serverList[i];
                print(server.internalIP);
                print(server.internalPort);
                serverSelectSource.addItem(new Atomic.UISelectItem(server.serverName, i));
            }

            serverSelect.setSource(serverSelectSource);
        }
    });

    Atomic.network.subscribeToEvent("ServerDisconnected", function() {
        print("Lost connection to server");

        remotePlayerClient.cleanup();

        Atomic.destroy(game.scene);

        var ui = require("./ui");
        ui.showMainMenu();
    });

    window.getWidget("cancel").onClick = function () {
        closeWindow();
        onClose();
    };

    window.getWidget("ok").onClick = function () {
        var selectedItemId = serverSelect.getSelectedItemID();
        var server = serverList[selectedItemId];

        closeWindow();
        onClose();

        var ui = require("./ui");
        ui.closeMainMenu();

        connectToServer(server);
    };

};

exports.shutdown = function() {

    closeWindow();

};
