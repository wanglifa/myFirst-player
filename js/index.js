var EventCenter = {
    on: function(type, handler){
        $(document).on(type, handler)
    },
    fire: function(type, data){
        $(document).trigger(type, data)
    }
}

EventCenter.on('hello',function(e, data){
    console.log(data)
})

EventCenter.fire('hello','你好')

var Footer = {
    $footer: null,
    $li: null,
    $ul: null,
    $box: null,
    $leftBtn: null,
    $rightBtn: null,
    init: function(){
        this.$footer = $('footer');
        this.$li = this.$footer.find('li');
        this.$ul = this.$footer.find('ul');
        this.$box = this.$footer.find('.box');
        this.isToEnd = false;
        this.isAnimate = false;
        this.isToStart = true;
        this.$leftBtn = this.$footer.find('.icon-left');
        this.$rightBtn = this.$footer.find('.icon-right');
        this.render()
        this.bind()
        
    },
    bind: function(){
        var _this = this;
        var boxWidth = _this.$box.css('width');
        var liWidth = _this.$footer.find('li').outerWidth(true);
        var currentRow = Math.floor(parseFloat(boxWidth)/parseFloat(liWidth));
        console.log(liWidth,boxWidth,currentRow)
        var ulLeft = currentRow*liWidth;
        var n = 1;
        var flag = true;
        console.log(_this.$ul.css('left'))
        _this.$rightBtn.on('click',function(){
            //下次点击按钮的时候如果当前动画还没完成直接就会返回，不会执行下面的代码，也就是_this.isAnimate = true
            if(_this.isAnimate) return;
            if(!_this.isToEnd){
                _this.isAnimate = true;
                _this.$ul.animate({
                    left: '-='+ulLeft
                },300,function(){
                    //animate的回调函数，动画完成后才执行里面的语句
                    if(parseFloat(boxWidth)-parseFloat(_this.$ul.css('left'))>=parseFloat(_this.$ul.css('width'))){
                        console.log('over')
                        _this.isToEnd = true;
                    }
                    _this.isToStart = false;
                    //只有动画完成了才能是false
                    _this.isAnimate = false;
                })
            }   
        })
        _this.$leftBtn.on('click',function(){
            if(_this.isAnimate) return;
            console.log(_this.isToStart)
            if(!_this.isToStart){
                _this.isAnimate = true;
                _this.$ul.animate({
                    left: '+='+ulLeft
                },300,function(){
                    _this.isToEnd = false;
                    _this.isAnimate = false;
                    if(parseFloat(_this.$ul.css('left'))>=0){
                        _this.isToStart = true;
                    }
                    console.log(_this.isToStart,parseFloat(_this.$ul.css('left')))
                })
            }   
        })
       
        _this.$footer.on('click','li',function(){
            $(this).addClass('active').siblings().removeClass('active');
            EventCenter.fire('select-album',{
                channelId: $(this).attr('data-channerl-id'),
                channelName: $(this).attr('data-name')
            })
        })
    },
    render: function(){
        var _this = this;
        $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
            .done(function(ret){
                console.log(ret.channels)
                _this.renderFooter(ret.channels)
                _this.setStyle()
            }).fail(function(){
                console.log('error')
            })
    },
    renderFooter: function(channerls){
        var _this = this;
        var html = '';
        console.log(channerls)
        channerls.forEach(function(value){
            //通过拿到JSON里的数据，来拼html
            html += `<li data-channerl-id=${value.channel_id} data-name=${value.name}>
                        <div class="cover" style="background-image:url(${value.cover_small})"></div>
                        <h3>${value.name}</h3>
                     </li>    
            `
        })
        _this.$ul.html(html)

    },
    setStyle: function(){
        var _this = this;
        var count = _this.$footer.find('li').length;
        //获得包含margin的单个li的宽度
        var width = _this.$footer.find('li').outerWidth(true);
        console.log(count,width)
        _this.$ul.css({
            width: (count*width)+'px'
        })

    }
}
Footer.init()
var Fm = {
    channelId: null,
    song: null,
    audio: null,
    channelName: null,
    currentTime: null,
    init: function(){
        this.audio = new Audio();
        this.audio.autoplay = true;
        this.bind();   
    },
    bind: function(){
        var _this = this; 
        EventCenter.on('select-album',function(e,channelObj){
            _this.channelId = channelObj.channelId;
            _this.channelName = channelObj.channelName;
            _this.loadMusic();
        })
        $('.btn-play').on('click',function(){
            if($(this).hasClass('icon-play')){
                $(this).removeClass('icon-play').addClass('icon-pause');
                _this.audio.play()
            }else{
                $(this).removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            }
        })
        $('.btn-next').on('click',function(){
            _this.loadMusic()
        })  
        _this.audio.addEventListener('playing',function(){
            console.log('playing')
            clearInterval(_this.currentTime)
            _this.getcurrentTime = setInterval(function(){
                _this.updateTime()
            },1000)
        })
        _this.audio.addEventListener('pause',function(){
            clearInterval(_this.getcurrentTime)
            console.log('pause')
        })
    },
    loadMusic: function(){
        var _this = this;
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:this.channelId})
        .done(function(ret){
            _this.song = ret['song'][0];
            console.log(_this.song);
            _this.setMusic()
            //因为歌词获取必须得在歌曲加载之后
            _this.loadLyric()
        })
    },
    //获取歌词，
    loadLyric: function(){
        var _this = this;
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid:_this.song.sid})
        .done(function(ret){
            console.log(ret)
            _this.lyricObj = {};
            _this.lyric= ret.lyric;
            _this.lyric.split('\n').forEach(function(line){
                var time = line.match(/\d{2}:\d{2}/g);
                var str = line.replace(/\[.+\]/g,'');
                if(Array.isArray(time)){
                    time.forEach(function(timer){
                        _this.lyricObj[timer]=str
                    })
                }
            })
        })
    },
    setMusic: function(){
        var _this = this;
        _this.audio.src = _this.song.url;
        $('.bg').css({
            'background-image':'url('+_this.song.picture+')'
        })
        $('figure').css({
            'background':'url('+_this.song.picture+')'
        })
        $('.detail h1').text(_this.song.title)
        $('.detail .author').text(_this.song.artist)
        $('.detail .tag').text(_this.channelName)
        console.log(_this.song)
        $('.btn-play').removeClass('icon-play').addClass('icon-pause')
    },
    updateTime: function(){
        var _this = this;
        var minute = Math.floor(this.audio.currentTime/60);
        var second = Math.floor(this.audio.currentTime%60);
        second<10?second='0'+second:second;
        $('.detail .current-time').text('0'+minute+':'+second);
        $('.bar-progress').css({
            width: (_this.audio.currentTime/_this.audio.duration)*100+'%'
        })
        var line = _this.lyricObj['0'+minute+':'+second];
        if(line){
            $('.lyric p').text(line).bottomText('fadeInLeft')
        }
        
    }
    
}
Fm.init()
//歌词动画
$.fn.bottomText = function(type){
    //如果传参数动画类型就是你传的，不传动画类型默认就是rollIn
    type = type || 'rollIn';
    var html = '';
    $(this).text().split('').map(function(value){
        html += `<span style="display: inline-block">${value}</span>`
    })
    $(this).html(html);
    var $span = $(this).find('span')
    var index = 0;
    var timer = setInterval(function(){
        $span.eq(index).addClass('animated '+type);
        index++;
        if(index>=$span.length){
            clearInterval(timer)
        }
    },300)
}
