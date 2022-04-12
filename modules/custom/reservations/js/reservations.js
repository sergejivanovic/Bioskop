function choosingGenre() {
    $("#genre").on("change", function () {
        $.ajax({
            method: "GET",
            url: "./movie_reservations?type=" + $("#genre").val(),
            success: function () {
                console.log('abc');
                window.location.href = "./movie_reservations?type=" + $("#genre").val();
            }
        });
    });
}

function SelectingMovie() {
    $(".item").click(function () {
        if (!$(this).is('.selectedMovie')) {
            $(this).toggleClass('selectedMovie')
            $(".button", this).show();
        } else {
            $(".item").removeClass('selectedMovie')
            $(".button", this).hide();
        }
    })
}

function validateInput() {


    $("#formName").submit(function () {
        const name = $('#customerName').val();
        const name_without_numbers = /^[A-Z][a-z]+$/;

        if (!name_without_numbers.test(name)) {

            $(this).toggleClass('button1')
            $(".button1", this).show();
        } else {
            $(".item").removeClass('button1')
            $(".button1", this).hide();
        }
        return false;
    })
}

choosingGenre();

SelectingMovie();

validateInput();
