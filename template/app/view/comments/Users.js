/**
 * View for showing users.
 * Either sorted by upvotes or comment count.
 */
Ext.define('Docs.view.comments.Users', {
    alias: "widget.commentsUsers",
    extend: 'Ext.panel.Panel',
    componentCls: "comments-users",
    requires: [
        "Docs.Comments",
        "Docs.view.SimpleSelectBehavior"
    ],

    layout: "border",

    /**
     * @event select
     * Fired when user is selected from users list.
     * @param {String} username  The name of the user
     * or undefined when all users were deselected.
     */

    initComponent: function() {
        this.items = [
            this.tabpanel = Ext.widget("tabpanel", {
                plain: true,
                region: "north",
                height: 25,
                items: [
                    {
                        title: "Votes"
                    },
                    {
                        title: "Comments"
                    }
                ],
                listeners: {
                    tabchange: this.onTabChange,
                    scope: this
                }
            }),
            this.list = Ext.widget("dataview", {
                region: "center",
                cls: "iScroll users-list",
                autoScroll: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ["username", "score", "emailHash", "moderator"]
                }),
                allowDeselect: true,
                tpl: [
                    '<ul>',
                    '<tpl for=".">',
                        '<li>',
                            '<span class="score">{score}</span>',
                            '<img class="avatar" width="25" height="25" src="http://www.gravatar.com/avatar/{emailHash}',
                                  '?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                            '<span class="username <tpl if="moderator">moderator</tpl>">{username}</span>',
                        '</li>',
                    '</tpl>',
                    '</ul>'
                ],
                itemSelector: "li"
            })
        ];

        new Docs.view.SimpleSelectBehavior(this.list, {
            select: this.onSelect,
            deselect: this.onDeselect,
            scope: this
        });

        this.callParent(arguments);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.fetchUsers("votes");
    },

    onTabChange: function(panel, newTab) {
        if (newTab.title === "Votes") {
            this.fetchUsers("votes");
        }
        else {
            this.fetchUsers("comments");
        }
    },

    /**
     * Clears the selection.
     */
    deselectAll: function() {
        this.list.getSelectionModel().deselectAll();
    },

    onSelect: function(user) {
        console.log("xselect");
        this.selectedUser = user;
        this.fireEvent("select", user.get("username"));
    },

    onDeselect: function() {
        this.selectedUser = undefined;
        this.fireEvent("select", undefined);
    },

    fetchUsers: function(sortBy) {
        Docs.Comments.request("jsonp", {
            url: '/users',
            method: 'GET',
            params: {
                sortBy: sortBy
            },
            success: this.loadUsers,
            scope: this
        });
    },

    loadUsers: function(users) {
        this.list.getStore().loadData(users);
        if (this.selectedUser) {
            var index = this.list.getStore().findExact("username", this.selectedUser.get("username"));
            this.list.getSelectionModel().select(index, false, true);
        }
    }
});