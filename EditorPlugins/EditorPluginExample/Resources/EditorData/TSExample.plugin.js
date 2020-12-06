"use strict";
var ExamplePluginUILabel = "TS Example Plugin";
var ExamplePluginTBPath = "EditorData/Example.tb.txt";
var InfoboxTBPath = "EditorData/Infobox.tb.txt";
var CustomEditorBuilder = (function () {
    function CustomEditorBuilder() {
    }
    /**
     * Returns true if this builder can generate an editor for this resource type
     */
    CustomEditorBuilder.prototype.canHandleResource = function (resourcePath) {
        return resourcePath.indexOf("custom.editor.json") > 0;
    };
    /**
     * Full path is the fully qualified path from the root of the filesystem.  In order to take advantage
     * of the resource caching system, let's trim it down to just the path inside the resources directory
     * including the Resources directory so that the casing is correct
     */
    CustomEditorBuilder.prototype.getNormalizedPath = function (path) {
        var RESOURCES_MARKER = "resources/";
        return path.substring(path.toLowerCase().indexOf(RESOURCES_MARKER));
    };
    /**
     * Generates a resource editor for the provided resource type
     * @param  resourcePath
     * @param  tabContainer
     */
    CustomEditorBuilder.prototype.getEditor = function (resourceFrame, resourcePath, tabContainer) {
        var _this = this;
        // point to a custom page
        var editorUrl = "atomic://" + ToolCore.toolSystem.project.resourcePath + "EditorData/customEditor.html";
        var editor = new Editor.JSResourceEditor(resourcePath, tabContainer, editorUrl);
        // one time subscriptions waiting for the web view to finish loading.  This event
        // actually hits the editor instance before we can hook it, so listen to it on the
        // frame and then unhook it
        editor.subscribeToEvent(WebView.WebViewLoadEndEvent(function (data) {
            editor.unsubscribeFromEvent(WebView.WebViewLoadEndEventType);
            var webClient = editor.webView.webClient;
            webClient.executeJavaScript("HOST_loadCode(\"atomic://" + _this.getNormalizedPath(editor.fullPath) + "\");");
        }));
        editor.subscribeToEvent(Editor.EditorDeleteResourceNotificationEvent(function (data) {
            var webClient = editor.webView.webClient;
            webClient.executeJavaScript("HOST_resourceDeleted(\"atomic://" + _this.getNormalizedPath(data.path) + "\");");
        }));
        editor.subscribeToEvent(Editor.UserPreferencesChangedNotificationEvent(function (data) {
            var webClient = editor.webView.webClient;
            webClient.executeJavaScript("HOST_preferencesChanged();");
        }));
        return editor;
    };
    return CustomEditorBuilder;
}());
var customEditorBuilder = new CustomEditorBuilder();
var TSExamplePluginService = (function () {
    function TSExamplePluginService() {
        var _this = this;
        this.name = "TSExampleService";
        this.description = "This service demonstrates plugin functionality functionality.";
        this.serviceLocator = null;
        this.extensionWindow = null;
        this.lastObjectName = null;
        this.totalUses = 0;
        this.handleWidgetEvent = function (ev) {
            if (!_this.extensionWindow) {
                return;
            }
            if (ev.type == Atomic.UI_EVENT_TYPE.UI_EVENT_TYPE_CLICK) {
                if (ev.target.id == "example_cancel") {
                    _this.extensionWindow.hide();
                    _this.extensionWindow = null;
                    return true;
                }
                if (ev.target.id == "example_speak") {
                    _this.serviceLocator.projectServices.setUserPreference(_this.name, "UsageCount", ++_this.totalUses);
                    _this.helloLabel.text = "Hello " + _this.nameField.text + ", This was used " + _this.totalUses + " times.";
                    return true;
                }
            }
            return false;
        };
    }
    TSExamplePluginService.prototype.initialize = function (serviceLoader) {
        Atomic.print("TSExamplePluginService.initialize");
        this.serviceLocator = (serviceLoader);
        if (this.serviceLocator) {
            this.serviceLocator.projectServices.register(this);
            this.serviceLocator.uiServices.register(this);
        }
    };
    TSExamplePluginService.prototype.projectUnloaded = function () {
        this.serviceLocator.uiServices.removeProjectContextMenuItemSource(ExamplePluginUILabel);
        this.serviceLocator.uiServices.removeHierarchyContextMenuItemSource(ExamplePluginUILabel);
        this.serviceLocator.uiServices.removePluginMenuItemSource(ExamplePluginUILabel);
        this.serviceLocator.uiServices.unregisterCustomEditor(customEditorBuilder);
        Atomic.print("TSExamplePluginService.projectUnloaded");
        if (this.serviceLocator) {
            this.serviceLocator.projectServices.unregister(this);
            this.serviceLocator.uiServices.unregister(this);
        }
    };
    TSExamplePluginService.prototype.projectLoaded = function (ev) {
        Atomic.print("TSExamplePluginService.projectLoaded");
        this.serviceLocator.uiServices.createPluginMenuItemSource(ExamplePluginUILabel, { "Open": ["tsexampleplugin open"] });
        this.serviceLocator.uiServices.createHierarchyContextMenuItemSource(ExamplePluginUILabel, { "Get name": ["tsexampleplugin hierarchy context"] });
        this.serviceLocator.uiServices.createProjectContextMenuItemSource(ExamplePluginUILabel, { "Get name": ["tsexampleplugin project context"] });
        this.totalUses = this.serviceLocator.projectServices.getUserPreference(this.name, "UsageCount", 0);
        this.serviceLocator.uiServices.registerCustomEditor(customEditorBuilder);
    };
    TSExamplePluginService.prototype.playerStarted = function () {
        Atomic.print("TSExamplePluginService.playerStarted");
    };
    TSExamplePluginService.prototype.menuItemClicked = function (refId) {
        Atomic.print("TSExamplePluginService.menuItemClicked: " + refId);
        if (refId == "tsexampleplugin open") {
            this.extensionWindow = this.serviceLocator.uiServices.showModalWindow(ExamplePluginUILabel, ExamplePluginTBPath, this.handleWidgetEvent);
            this.getWidgets();
            return true;
        }
        return false;
    };
    TSExamplePluginService.prototype.hierarchyContextItemClicked = function (node, refid) {
        Atomic.print("TSExamplePluginService.hierarchyContextItemClicked: " + node.name + " " + refid);
        if (refid == "tsexampleplugin hierarchy context") {
            this.lastObjectName = "node " + node.name;
            this.showInfobox("Hierarchy Item Selected ", "Node: '" + node.name + "' was selected.");
            return true;
        }
        return false;
    };
    TSExamplePluginService.prototype.projectContextItemClicked = function (asset, refid) {
        Atomic.print("TSExamplePluginService.projectContextItemClicked: " + asset.name + " " + refid);
        if (refid == "tsexampleplugin project context") {
            this.lastObjectName = "asset " + asset.name;
            this.showInfobox("Project Asset Selected", "Asset: '" + asset.name + "' was selected.");
            return true;
        }
        return false;
    };
    TSExamplePluginService.prototype.getWidgets = function () {
        if (!this.extensionWindow) {
            return;
        }
        this.helloLabel = this.extensionWindow.getWidget("example_hello");
        this.nameField = this.extensionWindow.getWidget("example_name");
        if (this.lastObjectName) {
            this.nameField.text = this.lastObjectName;
            this.lastObjectName = null;
        }
    };
    TSExamplePluginService.prototype.showInfobox = function (title, msg) {
        var infobox = this.serviceLocator.uiServices.showModalWindow(title, InfoboxTBPath, function (ev) {
            if (ev.type == Atomic.UI_EVENT_TYPE.UI_EVENT_TYPE_CLICK && ev.target.id == "infobox_ok") {
                infobox.hide();
                return true;
            }
        });
        var msgLabel = infobox.getWidget("infobox_msg");
        msgLabel.text = msg;
    };
    return TSExamplePluginService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new TSExamplePluginService();
