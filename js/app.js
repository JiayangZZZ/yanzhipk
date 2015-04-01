var APP = {
    getData:function(cbk){
        var data = new Array(16);
        var used = [false, false, false, false, false, false, false, false];
        for (var i = 0; i < 8; i++) {
            var index = parseInt(Math.random() * 8);
            while (used[index]) {
                index = parseInt(Math.random() * 8);
            }
            used[index] = true;
            var votes = parseInt(Math.random() * 100000);
            data[i*2] = {"src":"./images/"+index+"-1.png", "votes":votes};
            votes = parseInt(Math.random() * 100000);
            data[i*2+1] = {"src":"./images/"+index+"-2.png", "votes":votes};
        };
        console.log(data);

        cbk(data);
    },
    options:{
        anchor:['pageIndex','pageQuestions','pageAB','pageFail'],
        wxConfig:{
            debug:false,
            jsApiList:[
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo'
            ]
        },
        index:0,
        dataLength:20, //默认20条数据
        percent:100,
        num:200,
        isContinue:true,
        token:{
            upload_token:'',
            key:''
        },
        enabled:true,
        personNum:200,
        homepage:location.origin+location.pathname.replace('index.html',''),
        percentage: Math.round(Math.random()*30+60)+'%',
        rank: 1
    },
    EL:{
        pages:$('.page'),
        img:$('.side-img'),
        leftImg:$('#leftImg'),
        rightImg:$('#rightImg'),
        body:$(document.body),
        win:$(window)
    },
    init:function(){
        var ops = this.options,
            _this = this;

        function isPC() {
            var userAgentInfo = navigator.userAgent;
            var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad","iPod"];
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        }
        // 先在PC上调试
        if(isPC()){
        //    _this.showPage('pagePC');
        //    return false
        }
        //页面一进来异步读取数据和上传token 方便后续调用
        this.getData(function(data){
            _this.data = data;
            ops.dataLength = _this.data.length;
        });
        _this.hashChange();
        _this.bindEvents();
        this.getUploadToken();

    },
    bindEvents:function(){
        var EL = this.EL, ops = this.options,_this = this;

        $('#btnStart').tap(function(){
            _this.showPage('pageQuestions');
        });
        // PC测试用
        /*$('#btnStart').click(function(){
            _this.showPage('pageQuestions');
        });
        console.log("binding - wjl")
        */
        //PK图片切换
        EL.img.on('tap',function(){
        //EL.img.on('click',function(){
            if(!ops.isContinue) return false;
            ops.enabled = false;
            var $this = $(this);
            var index = EL.img.index($(this)),
                otherIndex = index== 0 ? 1:0,
                $other = EL.img.eq(otherIndex),
                votes = parseInt($(this).attr('votes')),
                otherVotes = parseInt($other.attr('votes'));
            //EL.sideText.eq(index).text(votes+'票');
            //EL.sideText.eq(otherIndex).text(otherVotes+'票');
            var iconCls ='icon-correct';

            // 调试 点左边就赢
            //if (index == 0) {
            if(votes>=otherVotes){//答对
                $this.next('.J_icon').attr('class','icon icon-correct modal J_icon');
                if(ops.index >=15 ){//ops.dataLength
                    //_this.getRank();
                    location.href='#!page=pageAB';
                    return false;
                }
                ops.enabled =true;
                setTimeout(function(){
                    var leftData = _this.getNextImg(),
                        rightData =_this.getNextImg();
                    $this.add($other).addClass('fadeOut');
                    $this.attr('src',leftData.src).attr('votes',leftData.votes);
                    $other.attr('src',rightData.src).attr('votes',rightData.votes);
                    setTimeout(function(){
                        $this.add($other).removeClass('fadeOut');
                    },200);

                    //EL.qNum.text(parseInt(ops.index/2));
                    //EL.sideText.text('我颜值更高');
                    $('.J_icon').addClass('hide');
                },500)
            }else{
                //location.href='#!page=pageFail';
                _this.showPage('pageFail');
                ops.isContinue = false;
                iconCls = 'icon-wrong';
                var step = ops.index/2-1,
                    //diffStep =ops.dataLength/2 -step,
                    diffStep =8 - step,
                    rnd = step ? parseFloat(Math.random().toFixed(2)) : 0;
                    rate = step*2*100/ops.dataLength+rnd; //+(step ? Math.random().toFixed(2) : '')
                var tipStr = '<div style="position: absolute;top: -6.5rem;left:.2rem;">点击右上角...分享，再来挑战一次吧！</div>你通过了'+step+'关，<br/>打败了<span class="yellow">'+rate+'%</span>的用户，<br/>骚年，还差'+diffStep+'关就<span class="yellow">挑战成功</span>了！<br/>';
                //var tipStr = '<div style="position: absolute;top: -6.5rem;left:.2rem;">点击右上角...分享，再来挑战一次吧！<span class="liarrow" style="display: block;top: -1rem;left: auto;right:-1.5rem"></span></div>你通过了'+step+'关，<br/>打败了<span class="yellow">'+rate+'%</span>的用户，<br/>骚年，还差'+diffStep+'关就<span class="yellow">挑战成功</span>了！<br/>';

                var tipStr2 = '最考验眼光的测试，我闯了'+step+'关，打败了'+rate+'%的用户！';
                setTimeout(function(){
                        APP.alert(tipStr,{
                            autoClose:false,
                            //id:'shareTipAlert'
                            id:'shareTipAlert'
                        });
                        shareJson.title=tipStr2;
                        shareJson.link = ops.homepage;
                        wx.ready(function(){
                            //分享数据
                            wx.onMenuShareTimeline(shareJson);
                            wx.onMenuShareAppMessage(shareJson);
                            wx.onMenuShareQQ(shareJson);
                            wx.onMenuShareWeibo(shareJson);
                        });
                },500);
            }
            $this.next('.J_icon').attr('class','icon modal J_icon '+iconCls);

        });

    },
    showPage:function(id){
        var EL = this.EL;
        EL.pages.removeClass('page-show').css('display','none');
        $('#'+id).css('display','block')
        setTimeout(function(){
            $('#'+id).addClass('page-show');
        },100);
        this[id] ? this[id]() : '';
    },
    pageQuestions:function(){
        //初始2张图
        $('.J_icon').addClass('hide');
        this.options.index=0;
        this.options.isContinue = true;
        //$('#qNum').text('1');
        var leftImg = this.getNextImg(),
            rightImg = this.getNextImg(),
            EL = this.EL;
        EL.leftImg.attr('src',leftImg.src).attr('votes',leftImg.votes);
        EL.rightImg.attr('src',rightImg.src).attr('votes',rightImg.votes);
        //变量初始化
        //this.options.
        //$('.J_icon').addClass('hide');

    },
    pageQuestResult:function(){

    },
    pageAB:function(){
    },
    // 分享窗口
    shareBox:function(){
        $('#shareMask').css('display','block');
        $('#shareDesc').css('display','block');
        $('.liarrow').css('display','block');
    },
    getNextImg:function(){
        var data = this.data;
        var src = data[this.options.index].src,
            votes = data[this.options.index].votes;
        //var rnd = Math.floor(Math.random()*data.length),
        //    src = data[rnd].src,
        //    votes = data[rnd].votes;
        this.options.index++;
        //this.data.splice(rnd,1);
        return {
            src:src,
            votes:votes
        }
    },
    alert:function(msg,ops){
        var config = {
            autoClose:2000, //timer
            cls:'alert-animated',
            id:'alert'
        },
        EL = this.EL;
        config = $.extend(config,ops);
        var $alert,
            element = document.getElementById(config.id);
        if(element){
            $alert = $(element);
            $alert.find('.alert-content').html(msg)
        }else{
            var htmls = '<div id="'+config.id+'" class="alert">\
                    <div class="mask"></div>\
                        <div class="alert-content-wrap modal">\
                            <div class="alert-content">'+msg+'</div>\
                        </div>\
                </div>';
            EL.body.append(htmls);
            $alert = $('#'+config.id);
        }
        EL.pages.addClass('blur');
        //默认show
        $alert.addClass(config.cls);
        if(config.autoClose){
            setTimeout(function(){
                EL.pages.removeClass('blur');
                $alert.removeClass(config.cls);
            },config.autoClose)
        }
        return {
            hide:function(){
                EL.pages.removeClass('blur')
                $alert.removeClass(config.cls);
            },
            show:function(){
                EL.pages.addClass('blur')
                $alert.addClass(config.cls);
            }
        }
    },
    hashChange:function(el,data){
        var ops = this.options,
            _this = this;
        $(window).bind('hashchange load',function(){
            var hash = $.trim(location.hash).substr(2).split('&'),  // 初始URL #! 展示对应页面
                params = {page:'pageIndex'};
            $.each(hash,function(key,value){
                var arr = value.split('=');
                params[arr[0]] = arr[1]
            });
            var pid = $.inArray(params.page,ops.anchor)>-1 ? params.page : ops.anchor[0];
            _this.showPage(pid);
        });
    }
}
var shareJson = {
    title:'史上最考验审美的测试，我闯了8关，求超越！',
    link:APP.options.homepage,
    imgUrl:'http://zhangjiayang.dev.p1staff.com/yanzhipk/images/loge.jpg',
    success:function(){

    },
    cancel:function(){

    }
}
wx.ready(function(){
    //分享数据
    wx.onMenuShareTimeline(shareJson);
    wx.onMenuShareAppMessage(shareJson);
    wx.onMenuShareQQ(shareJson);
    wx.onMenuShareWeibo(shareJson);
});
APP.init();
//APP.WxInit();
