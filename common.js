//Подготовка данных
var mapScalefactor = 10; //Масштаб [пикселей/метр]
var GreedStep = 20; //Шаг сетки в пикселях.
var arrayContainerOBJ = [];


$.ajax({
                        type: "GET", 
                        url: "../bd",                  
                                            
                        success: function(data) {
                        console.log("GetData from database- success"); 
                            var arrayContainerOBJ_Loader=JSON.parse(data);
                            console.log(arrayContainerOBJ_Loader); 

                            var c=0;
                            arrayContainerOBJ_Loader.forEach(function(standOBJ) {   

                                arrayContainerOBJ[c] = {
                                    width: 200,
                                    height: 200,
                                    pos_x: Number(standOBJ.stand_localtion_plan.pos_x),
                                    pos_y: Number(standOBJ.stand_localtion_plan.pos_y),
                                    div_class: '',
                                    div_id: 'recObject-' + arrayContainerOBJ.length + '',
                                    name: standOBJ.name,
                                    color: 'f6ab1a', //NEW Param
                                    companyName: 'компания', //NEW Param
                                    lead_id: standOBJ.lead_id,
                                    local_rectangles: standOBJ.stand_localtion_plan.local_rectangles
                                };

                                c++;
                            });

                            drowRectangle(); //Отрисовка контейнеров объектов

                            drowMainList();

                            //кнопка Добавить блок - не нужна пока.
                            $('#toolbar-main-add').on("click", function() {
                                pushArray();
                                drowRectangle();
                                drowMainList();
                            });


                        },

                        error:function(data) {
                        console.log("Get_CF_Data - error");
                        console.log(data);
                        }
}); 


//Debug load
console.log('arrayContainerOBJ');
console.log(arrayContainerOBJ);

//pushArray - функция не используется
function pushArray() { 
    arrayContainerOBJ.push({
        width: 350,
        height: 200,
        pos_x: 0,
        pos_y: 0,
        div_class: '',
        div_id: 'recObject-' + arrayContainerOBJ.length + '',
        name: 'объект' + arrayContainerOBJ.length + '',
        local_rectangles: [{
            div_id: 0,
            width: 100,
            height: 100,
            pos_x: 0,
            pos_y: 0,
        }, {
            div_id: 1,
            width: 150,
            height: 100,
            pos_x: 200,
            pos_y: 0,
        }, {
            div_id: 2,
            width: 300,
            height: 100,
            pos_x: 50,
            pos_y: 100,
        }, ]
    });

}

function pushSubArray(id) {
    arrayContainerOBJ[id].local_rectangles.push({
        div_id: arrayContainerOBJ[id].local_rectangles.length,
        width: 100,
        height: 100,
        pos_x: 0,
        pos_y: 0
    });
}

///////////////////////////
// UI Drow function
///////////////////////////

//Отрисовка объектов
function drowRectangle() {
    $.each(arrayContainerOBJ, function(key, value) {
        //проверка наличия уже отривосанных объектов
        if ($('#recObject-' + key + '').length <= 0) {
            $(".main-screen").append('<div data-id="' + key + '" id="' + value.div_id + '" class="obj_container' + value.div_class + '" style="width: ' + value.width + 'px; height: ' + value.height + 'px;"></div>');
            $("#" + value.div_id).css("left", value.pos_x).css("top", value.pos_y);
            //Внутр структура
            //Отрисовать внутренную структуру объекта 
            var droSRw = drowSubRectangle.bind(this);
            droSRw();
            //Имя
            $("#" + value.div_id).append('<div class="obj_container_text">' + value.name + '</div>');
            // dragElement(document.getElementById(value.div_id)); //Назначить элементу функцию перетаскивания по ID 
            $('.obj_container').draggable({
                grid: [GreedStep, GreedStep]
            });
            $( ".obj_container" ).dblclick(Editor);
        }
    });

}


//внешняя функция отрисовки внутренних блоков
function drowSubRectangle() {
    var div_id = this.div_id;
    this.local_rectangles.forEach(function(rect) {
        if ($('#' + div_id + ' > [data-id-sub-rect=' + rect.div_id + ']').length <= 0) {
            $("#" + div_id).append('<div data-id-sub-rect="' + rect.div_id + '" class="local_rectangle' + '" style="width: ' + rect.width + 'px; height: ' + rect.height + 'px; left:' + rect.pos_x + 'px; top:' + rect.pos_y + 'px;"></div>');
        }
    });

}

//отрисовка в тулбаре списка обьектов из массива
function drowMainList() {
    $('.block-list').empty();
    $.each(arrayContainerOBJ, function(key, value) {
        $('.block-list').append('<div class="block-list__item"><div class="block-list__name">' + value.name + '</div><button data-id="' + key + '"  class="block-list__edit">Редактировать</button></div>');
    });
    buttonEdit(); //привязка обработчика к отрисовке
}


//отрисовка тулбара редактирования 
function drowEditList(id) {
    // $('.edit-list').empty();
    arrayContainerOBJ[id].local_rectangles.forEach(function(elem) {

        // console.log(elem.div_id);
        if ($('.edit-list__item[data-edit-id=' + elem.div_id + ']').length <= 0) {
            $('.edit-list').append('<div data-edit-id="' + elem.div_id + '" class="edit-list__item"><div class="block-list__name"> блок' + elem.div_id + '</div><input type="number" name="edit-list__width" value="' + elem.width + '"><input type="number" name="edit-list__height" value="' + elem.height + '"><button class="edit-list__delite">X</button>');
        }
    });
    $('[name=edit-list__width]').on('input', function() {
        $('.editable > .local_rectangle[data-id-sub-rect=' + $(this).parent().attr('data-edit-id') + ']').css('width', this.value);
    });
    $('[name=edit-list__height]').on('input', function() {
        $('.editable > .local_rectangle[data-id-sub-rect=' + $(this).parent().attr('data-edit-id') + ']').css('height', this.value);
    });
    $('.edit-list__delite').on('click', function(){
        $(this).parent().remove();
        $('.editable > [data-id-sub-rect=' + $(this).parent().attr('data-edit-id') + ']').remove();
        delete arrayContainerOBJ[$('.editable').attr('data-id')].local_rectangles[$(this).parent().attr('data-edit-id')];
    });
}


///////////////////////////
// UI ELements functions
///////////////////////////

//кнопка Редактировать
function buttonEdit() {
    $('.block-list__edit').on("click", Editor);

}
function Editor(){
    $('.toolbar-blocks').hide();
    console.log(this);
        $('.toolbar-edit').show();
        drowEditList($(this).attr('data-id'));
        $('#recObject-' + $(this).attr('data-id')).addClass('editable');
        $('.main-screen').append('<div class="overlay"></div>');
        $('.main').addClass('main_edit');
        $('.obj_container').draggable('disable');
        $('.local_rectangle').draggable({
            grid: [GreedStep, GreedStep]
        });
}
//кнопка Добавить блок в тулбаре редактирования внутренних блоков
$('#toolbar-edit-add').on("click", function() {
    pushSubArray($('.editable').attr('data-id'));
    drowEditList($('.editable').attr('data-id'));
    var editDrowSR = drowSubRectangle.bind(arrayContainerOBJ[$('.editable').attr('data-id')]);
    editDrowSR();

    $('.local_rectangle').draggable({
        grid: [GreedStep, GreedStep]
    });
});

//кнопка Сохранить изменения в тулбаре редактирования внутренних блоков
$('#toolbar-edit-save').on("click", function() {
    $('.editable').children('.local_rectangle').each(function(i, item) {
        
        arrayContainerOBJ[$('.editable').attr('data-id')].local_rectangles[$(this).attr('data-id-sub-rect')].width = $(this).outerWidth();
        arrayContainerOBJ[$('.editable').attr('data-id')].local_rectangles[$(this).attr('data-id-sub-rect')].height = $(this).outerHeight();
        arrayContainerOBJ[$('.editable').attr('data-id')].local_rectangles[$(this).attr('data-id-sub-rect')].pos_y = $(this).position().top;
        arrayContainerOBJ[$('.editable').attr('data-id')].local_rectangles[$(this).attr('data-id-sub-rect')].pos_x = $(this).position().left;

    });
    $('.toolbar-edit').hide();
    $('.toolbar-blocks').show();
    $('.editable').removeClass('editable');
    $('.overlay').remove();
    $('.main_edit').removeClass('main_edit');
    $('.obj_container').draggable('enable');
    $('.local_rectangle').draggable('destroy');

});

//Кнопка Сохранить позиции контейнеров объектов
$("#toolbar-main-save").on("click", function(e) {
    //alert(arrayContainerOBJ[1]['pos_y']);
    $('.obj_container').each(function(i, item) {

        $.each(arrayContainerOBJ, function(key, value) {
            if (value.div_id == item.id) {
                arrayContainerOBJ[key]['pos_x'] = $(item).offset().left;
                arrayContainerOBJ[key]['pos_y'] = $(item).offset().top;
            }
        });

    });

    //TODO for Mikahil: Передать arrayContainerOBJ в базу данных
});

//перетаскивание рабочей области по клику
(function () {
        var scr = document.querySelector('.main');
        var helper = $('.helper');
        helper.mousedown(function () {
            var startX = scr.scrollLeft + event.pageX;
            var startY = scr.scrollTop + event.pageY;
            helper.mousemove(function () {
                scr.scrollLeft = startX - event.pageX;
                scr.scrollTop = startY - event.pageY;
                return false;
            });
        });
        $(".main").mouseup(function () {
            helper.off("mousemove"); 
        });
    })();
//двойной клик - редактирование
