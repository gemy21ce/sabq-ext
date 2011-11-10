/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var notifications=[];
var currentVersion='1.1.1';
var ReaderBG={
    /**
     * contructor
     */
    ReaderBG:function(){
        if(! window.localStorage.data){
            window.localStorage.data=JSON.stringify(data);
        }
        data = JSON.parse(window.localStorage.data);
        if(! data.varsion || data.version != currentVersion){
            window.localStorage.data=JSON.stringify(data);
        }
        ReaderBG.updateRSS();
        window.setInterval('ReaderBG.updateRSS()', 1000 * 60 * 60);
    },
    /**
     * read from url and process handler on success.
     */
    read:function(item,handler){
        /*jQuery.getFeed({
            url:item.url,
            success:function(rss){
                handler(rss,item.id);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
            }
        });*/
        $.ajax({
            url:item.url,
            dataType:'json',
            success:function(rss){
                handler(rss,item.id);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
            }
        });
    },
    /**
     * update method that will be called to update rss
     */
    updateRSS:function(){
        notifications=[];
        data=JSON.parse(window.localStorage.data);
        for(var i=0;i<data.categories.length;i++){
            if(data.categories[i].active==true){
                ReaderBG.read(data.categories[i], function(rss,itemId){
                    var origin=[];
                    if(window.localStorage['rss-cat-'+itemId]){
                        origin=JSON.parse(window.localStorage['rss-cat-'+itemId]);
                    }
                    var counter=ReaderBG.concatLists(origin, rss.items,'rss-cat-'+itemId);
                    ReaderBG.setBadgeText(counter);
                    data.categories[itemId-1].unreaditems=counter;
                    window.localStorage.data=JSON.stringify(data);
                });
            }
        }
        window.setTimeout("ReaderBG.runNotifications()", 1000 * 60 );
    },
    /**
     * concatenate lists and return the number of unread items.
     */
    concatLists:function(origin,newlist,storeKey){
        var i=0;
        var counter=0;
        if(origin.length == 0){
            for(i=0;i<newlist.length;i++){
                var element={
                    title:newlist[i].title,
                    //link:newlist[i].link,//http://sabq.org/sabq/user/news.do?section=5&id=18233
                    link:'http://sabq.org/sabq/user/news.do?section='+newlist[i].sectionid+'&id='+newlist[i].id,
                    description:newlist[i].subtitle,
                    img:newlist[i].pic,
                    newsid:newlist[i].id,
                    unread:true
                }
                origin.push(element);
            }
            counter=i;
            window.localStorage[storeKey]=JSON.stringify(origin);
            notifications.push(origin[0]);
            return counter;
        }
        i=0;
        while(i < newlist.length && (origin[0].newsid != newlist[i].id)){
            i++;
        }
        while(i > 0){
            origin.unshift({
                title:newlist[i-1].title,
                //link:newlist[i].link,
                //description:newlist[i].description,
                link:'http://sabq.org/sabq/user/news.do?section='+newlist[i-1].sectionid+'&id='+newlist[i-1].id,
                description:newlist[i-1].subtitle,
                img:newlist[i-1].pic,
                newsid:newlist[i-1].id,
                unread:true
            });
            origin.pop();
            counter++;
            i--;
        }
        window.localStorage[storeKey]=JSON.stringify(origin);
        if(counter > 0){
            notifications.push(origin[0]);
        }
        return counter;
    },
    /**
     * fire the html nnotification.
     */
    fireNotification:function(title,img,description,link,close){
        var htmlPath='notification.html?'+'title='+encodeURIComponent(title)+"&img="+(img != null?encodeURIComponent(img):'images/logo.png')+"&desc="+encodeURIComponent(description)+"&link="+encodeURIComponent(link)+"&close="+close;
        var notification = webkitNotifications.createHTMLNotification(htmlPath);
        notification.show();
    },
    runNotifications:function(){
        if(notifications.length > 0){
            ReaderBG.fireNotification(notifications[0].title, notifications[0].img, notifications[0].description, notifications[0].link, 10);
            notifications.shift();
            window.setTimeout("ReaderBG.runNotifications()", 1000 * 30);
        }
    },
    setBadgeText:function(text){
        if(! window.localStorage.badgeText){
            window.localStorage.badgeText=0;
        }
        text+=parseInt(window.localStorage.badgeText);
        window.localStorage.badgeText=text;
        chrome.browserAction.setBadgeText({
            text:""+(text==0?'':text)
        });
    }
}
$(function(){
    ReaderBG.ReaderBG();
})