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
    init: function(){
        this.$footer = $('footer');
        this.bind()
        this.render()
    },
    bind: function(){
        var _this = this;
        // $(window).resize(function(){
        //     _this.setStyle()
        // })
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
            html += `<li data-channerl-id=${value.channel_id}>
                        <div class="cover" style="background-image:url(${value.cover_small})"></div>
                        <h3>${value.name}</h3>
                     </li>    
            `
        })
        _this.$footer.find('ul').html(html)

    }
}
Footer.init()