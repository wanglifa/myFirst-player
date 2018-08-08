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
        this.isToStart = true;
        this.$leftBtn = this.$footer.find('.icon-left');
        this.$rightBtn = this.$footer.find('.icon-right');
        this.render()
        this.bind()
        
    },
    bind: function(){
        var _this = this;
        // $(window).on('resize',function(){
        //     //为什么这个setStyle只有放在resize事件里才能获取到正确的li的数量
        //     _this.setStyle()
        // })
        var boxWidth = _this.$box.css('width');
        var liWidth = _this.$footer.find('li').outerWidth(true);
        var currentRow = Math.floor(parseFloat(boxWidth)/parseFloat(liWidth));
        console.log(liWidth,boxWidth,currentRow)
        var ulLeft = currentRow*liWidth;
        var n = 1;
        var flag = true;
        console.log(_this.$ul.css('left'))
        _this.$rightBtn.on('click',function(){
            
            if(!_this.isToEnd){
                _this.$ul.animate({
                    left: '-='+ulLeft
                },300,function(){
                    if(parseFloat(boxWidth)-parseFloat(_this.$ul.css('left'))>=parseFloat(_this.$ul.css('width'))){
                        console.log('over')
                        _this.isToEnd = true;
                    }
                })
            }
            
            
            
        })
        
    },
    render: function(){
        var _this = this;
        $.getJSON('http://api.jirengu.com/fm/getChannels.php')
            .done(function(ret){
                console.log(ret.channels)
                _this.renderFooter(ret.channels)
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
            html += `<li data-channerl-id=${value.channel_id}>
                        <div class="cover" style="background-image:url(${value.cover_small})"></div>
                        <h3>${value.name}</h3>
                     </li>    
            `
        })
        _this.$ul.html(html)
        _this.setStyle()

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