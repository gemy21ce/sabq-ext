/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var data=null;
var imgs=[];
var ReaderPOPUP={
    /**
     * cut text and test if it's white space or not.
     */
    cutText:function(text,indexB,append){
        if(text==null|| text.length ==0){
            return '';
        }
        for( i =0 ; i< 20 ; i++){
            if(text.charAt( indexB) != " "){
                indexB++;
            }else{
                i=20;
            }
        }
        return text.substring(0, indexB)+" "+append;
    },
    /**
     * get the menu items.
     */
    menu:function(){
        var out='';
        for(i=0; i<data.categories.length; i++){
            if(data.categories[i].active == true){
                out+='<li onclick="ReaderPOPUP.openCategory(this.id)" id="cat-'+data.categories[i].id+'">';
                if(data.categories[i].unreaditems > 0){
                    out+='<span class="new-news">'+data.categories[i].unreaditems+'</span>';
                }
                out+=data.categories[i].title;
                out+='</li>';
            }
        }
        return out;
    },
    /**
     * constructor
     */
    ReaderPOPUP:function(){
        data=JSON.parse(window.localStorage.data);
        $("ul#tabs-menu").html(ReaderPOPUP.menu());
        if(window.localStorage.lastTab){
            var lastTab=JSON.parse(window.localStorage.lastTab);
            ReaderPOPUP.openCategory(lastTab.tabId);
        }else{
            $(document.getElementById('tabs-menu').firstChild).trigger('click');
        }
        chrome.browserAction.setBadgeText({
            text:""
        });
        window.localStorage.badgeText=0;
    },
    /**
     * open category from menu clicking.
     */
    openCategory:function(id){
        if(!window.localStorage['rss-'+id]){
            $("#tabs-content").html('<center><br/><br/><br/><br/><br/><img align="center" src="images/loading.gif"/></center>');
            window.setTimeout("ReaderPOPUP.openCategory('"+id+"')", 1000);
            return;
        }
        var cat=JSON.parse(window.localStorage['rss-'+id]);
        var rows=ReaderPOPUP.getrows(cat);
        $("#tabs-content").html(rows.out);
        var lastTab={
            tabId:id
        }
        var dataid=parseInt(id.substr(4));
        data.categories[dataid-1].unreaditems=0;
        window.localStorage.data=JSON.stringify(data);
        window.localStorage['rss-'+id]=JSON.stringify(rows.list);
        window.localStorage.lastTab=JSON.stringify(lastTab);
        ReaderPOPUP.setCurrentTab(id);
        
        window.setTimeout('ReaderPOPUP.removeUreadCountLable("'+id+'");', 1000 * 1)
    },
    /**
     * generate the rows from list of objects
     */
    getrows:function(list){
        imgs=[];
        var out="";
        for(var i =0;i<list.length;i++){
            out+='<div class="news-box '+(list[i].unread == true?'news-box-unread':'')+'">';
            out+=(list[i].unread == true?'<span class="unread"></span>':'');
            list[i].unread = false;
            if(list[i].img == null || list[i].img == ''){
                out+='<div class="box-news-left box-news-nophoto">';
            }else{
                imgs.push({
                    id:i,
                    src:list[i].img
                })
                out+='<div class="news-photo"><img alt="" id="img-'+i+'" width="72" height="51"></img></div>';
                out+='<div class="box-news-left">';
            }
            out+='<div class="box-news-title"><a style="cursor:pointer;" onclick="ReaderPOPUP.openURL(\''+list[i].link+'\');">'+list[i].title+'</a></div>';
            out+='<div class="box-news-brief">';
            out+=ReaderPOPUP.cutText(list[i].description, 150, "...");
            out+='</div>';
            out+='</div>';
            out+='</div>';
        }
        //special for sabq
        window.setTimeout("ReaderPOPUP.setImages()", 5);
        return {
            out:out,
            list:list
        };
    },
    /**
     * add current class to current tab
     */
    setCurrentTab:function(tabid){
        $('.current').removeClass('current');
        $('#'+tabid).addClass('current');
    },
    /**
     * removed the unread items count from the tab.
     */
    removeUreadCountLable:function(id){
        if($(document.getElementById(id).firstChild).hasClass('new-news')){
            $(document.getElementById(id).firstChild).remove();
        }
    },
    /**
     * special for sabq images
     */
    setImages:function(){
        for(i=0;i<imgs.length;i++){
            $('#img-'+imgs[i].id).attr('src',imgs[i].src);
        }
    },
    openURL:function(url){
        chrome.tabs.create({
            url:url,
            selected:false
        });
    }
}
$(function(){
    ReaderPOPUP.ReaderPOPUP();
})