const NBL_certifcate_template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Business License</title>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {

            font-family: "Roboto", sans-serif;
            margin: 0;
            padding: 0px 0 0 0;
            color: #525659;
            font-size: 14px;
            /* Increased base font size */
        }

        .d-flex {
            display: flex !important;
        }

        .justify-content-between {
            justify-content: space-between !important;
        }

        .main-title {
            font-size: 30px;
            color: #0096f5;
            font-weight: 900;
        }

        .border {
            height: 6px;
            background: #0094f6;
            position: relative;
        }

        .border::after {
            content: "";
            height: 100%;
            width: 33.33%;
            background: #a1d3f4;
            position: absolute;
            top: 0;
            left: 0;
        }

        .border::before {
            content: "";
            height: 100%;
            width: 33.33%;
            background: #005088;
            position: absolute;
            top: 0;
            right: 0;
        }
        
        .content {
            margin-top: 310px;
            page-break-inside: auto
        }

        .page {
            page-break-after: always;
        }

        .page:last-child {
            page-break-after: auto;
        }

        .mt-4 {
            margin-top: 24px !important;
        }
        .mt-3 {
            margin-top: 16px;
        }
        .mb-1 {
            margin-bottom: 4px;
        }
        .mb-3 {
            margin-bottom: 16px;
        }
     

        .text p {
            line-height: 160%;
        }

        .text p+p {
            margin-top: 30px;
        }

        .header-section {
            position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            width: 100%;
            z-index: 99;
            overflow: hidden;

        }

        .header-section .top-content {
            padding: 30px 45px 20px 50px;
            justify-content: space-between;
            align-items: center;
        }

        .header-section .top-content .main-title {

            max-width: 500px;
        }

        .header-section .logo img {
            height: 100px;
            width: 100px;

        }

        .header-section .bottom-content .main-title {
            text-align: center;
            margin-top: 35px;
            text-transform: uppercase;
        }

        .header-section .bottom-content {
            padding: 25px 45px 40px 50px;
        }

        .main-content {
            padding: 0 45px;
        }

        .main-content .signature{
            max-width: 200px;
            width: 100%;
            text-align: center;
        }
        .main-content .signature .sign{
            border-bottom:2px solid #929597;
            display: inline-block;
            width: 100%;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .main-content .signature .name{
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .main-content .qr-code{
            align-items: end;
        }
        .main-content .box-wrap{
            align-items: end;
            margin-top: 50px;
        }
        .main-content .box{
            border:1px solid #929597;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 50%;
            font-size: 15px;

        }
        
        .footer-section{
            position: fixed;
            bottom: 45px;
            left: 0;
            right: 0;
            z-index: 99;
        }
        .footer-section .f-content{
            background-color: #0094f6;
            justify-content: space-around;
            padding:15px 0;
            color: #fff;
        }
        .footer-section .f-content .icon{
            margin-right: 6px;
        }
    </style>
</head>

<body>
<header class="header-section">
        <div class="top-content d-flex">
            <h2 class="main-title">Department of Inland Revenue
                Business License Unit
            </h2>
            <div class="logo">
                <img src="@@department_logo@@" alt="">
            </div>
        </div>
        <div class="border"></div>
        <div class="bottom-content">
            <div class="d-flex justify-content-between ">
                <div>Certificate No: <span>@@certificate_number@@</span></div>
                <div>Date: <span>@@certificate_created_date@@</span></div>
            </div>
            <h2 class="main-title">Business License Certificate</h2>
        </div>
    </header>

    @@main_body_content@@


   <div class="footer-section">
     <div class="f-content d-flex">
        <div class="d-flex">
            <span class="icon"><img src="./img/call.png" alt=""></span>
             @@department_phone_no@@
        </div>
        <div class="d-flex">
            <span class="icon"><img src="./img/email.png" alt=""></span>
             @@department_email@@
        </div>
        <div class="d-flex">
            <span class="icon"><img src="./img/web.png" alt=""></span>
             @@department_website@@
        </div>
     </div>
     <div class="border mt-3"></div>
    </div>
</body>
</html>`;

const TCS_certifcate_template = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tax Compliance Certificate</title>
     <style>
        @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {

            font-family: "Roboto", sans-serif;
            margin: 0;
            padding: 0px 0 0 0;
            color: #525659;
            font-size: 14px;
            /* Increased base font size */
        }

        .d-flex {
            display: flex !important;
        }

        .justify-content-between {
            justify-content: space-between !important;
        }

        .main-title {
            font-size: 28px;
            color: #039e9e;
            font-weight: 900;
        }

        .border {
            height: 6px;
            background: #009f9d;
            position: relative;
        }

        .border::after {
            content: "";
            height: 100%;
            width: 33.33%;
            background: #71d0d1;
            position: absolute;
            top: 0;
            left: 0;
        }

        .border::before {
            content: "";
            height: 100%;
            width: 33.33%;
            background: #00615f;
            position: absolute;
            top: 0;
            right: 0;
        }

        .content {
            margin-top: 265px;
            page-break-inside: auto
        }

        .page {
            page-break-after: always;
        }

        .page:last-child {
            page-break-after: auto;
        }

        .mt-4 {
            margin-top: 24px !important;
        }

        .mt-3 {
            margin-top: 16px;
        }

        .mb-1 {
            margin-bottom: 4px;
        }

        .mb-3 {
            margin-bottom: 16px;
        }

        .mb-4 {
            margin-bottom: 24px;
        }


        .text p {
            line-height: 160%;
        }

        .text p+p {
            margin-top: 16px;
        }
        .text ul li{
            list-style: none;
            position: relative;
            padding-left: 25px;
        }
        .text ul li::after{
            content: "";
            height: 5px;
            width: 5px;
            background-color: #525659;
            position: absolute;
            top: 5px;
            left: 10px;
            border-radius: 100%;
        }
        
        .header-section {
            position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            width: 100%;
            z-index: 99;
            overflow: hidden;

        }

        .header-section .top-content {
            padding: 30px 45px 20px 50px;
            justify-content: space-between;
            align-items: center;
        }

        .header-section .top-content .main-title {

            max-width: 500px;
        }

        .header-section .logo img {
            max-width: 85px;
        }

        .header-section .bottom-content .main-title {
            text-align: center;
            margin-top: 25px;
            text-transform: uppercase;
        }

        .header-section .bottom-content {
            padding: 25px 45px 20px 50px;
        }

        .main-content {
            padding: 0 45px;
        }

        .main-content .signature {
            max-width: 200px;
            width: 100%;
            text-align: center;
        }

        .main-content .signature .sign {
            border-bottom: 2px solid #929597;
            display: inline-block;
            width: 100%;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .main-content .signature .name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 10px;
        }


        .main-content .qr-code {
            align-items: end;
        }

        .main-content .box-wrap {
            width: 50%;
            display: flex;
            flex-direction: column;
            align-items: end;
        }

        .main-content .box {
            border: 1px solid #929597;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
            font-size: 15px;

        }

        .footer-section {
            position: fixed;
            bottom: 45px;
            left: 0;
            right: 0;
            z-index: 99;
        }

        .footer-section .f-content {
            background-color: #039e9e;
            justify-content: space-around;
            padding: 15px 0;
            color: #fff;
        }

        .footer-section .f-content .icon {
            margin-right: 6px;
        }
    </style>
</head>

<body>
    <header class="header-section">
        <div class="top-content d-flex">
            <h2 class="main-title">
                Cayman Islands Government Department of Taxation
            </h2>
            <div class="logo">
                <img src="@@department_logo@@" alt="">
            </div>
        </div>
        <div class="border"></div>
        <div class="bottom-content">
            <div class="d-flex justify-content-between ">
                <div><strong> Certificate No: <span>@@certificate_number@@</span></strong></div>
                <div><strong>Date: <span>@@certificate_created_date@@</span></strong></div>
            </div>
            <h2 class="main-title">Tax Compliance certificate</h2>
        </div>
    </header>

    @@main_body_content@@
    <div class="footer-section">
        <div class="f-content d-flex">
            <div class="d-flex">
                <span class="icon"><img src="./img/call.png" alt=""></span>
                @@department_phone_no@@
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/email.png" alt=""></span>
                @@department_email@@
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/web.png" alt=""></span>
                @@department_website@@
            </div>
        </div>
        <div class="border mt-3"></div>
    </div>

</body>

</html>`;

const PCS_certifcate_template = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Police Certificate</title>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {

            font-family: "Roboto", sans-serif;
            margin: 0;
            padding: 0px 0 0 0;
            color: #525659;
            font-size: 14px;
            /* Increased base font size */
        }

        .d-flex {
            display: flex !important;
        }

        .justify-content-between {
            justify-content: space-between !important;
        }

        .main-title {
            font-size: 28px;
            color: #85705b;
            font-weight: 900;
        }

        .border {
            height: 6px;
            background: #837057;
            position: relative;
        }

        .border::after {
            content: "";
            height: 100%;
            width: 33.33%;
            background: #b3977a;
            position: absolute;
            top: 0;
            left: 0;
        }

        .border::before {
            content: "";
            height: 100%;
            width: 33.33%;
            background: #414f59;
            position: absolute;
            top: 0;
            right: 0;
        }

        .content {
            // margin-top: 280px;
            page-break-inside: auto
        }
        .page {
            page-break-after: always;
        }
        .page:last-child {
            page-break-after: auto;
        }
        .mt-5 {
            margin-top: 48px !important;
        }
        .mt-4 {
            margin-top: 24px !important;
        }
        .mt-2 {
            margin-top: 8px;
        }
        .mt-3 {
            margin-top: 16px;
        }
        .mb-1 {
            margin-bottom: 4px;
        }

        .mb-3 {
            margin-bottom: 16px;
        }

        .mb-4 {
            margin-bottom: 24px;
        }


        .text p {
            line-height: 160%;
        }

        .text p+p {
            margin-top: 30px;
        }
        
        .header-section {
            // position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            width: 100%;
            z-index: 99;
            overflow: hidden;

        }

        .header-section .top-content {
            padding: 30px 45px 20px 50px;
            justify-content: space-between;
            align-items: center;
        }

        .header-section .top-content .main-title {

            max-width: 500px;
        }

        .header-section .logo img {
            max-width: 85px;
        }

        .header-section .bottom-content .main-title {
            text-align: center;
            margin-top: 25px;
            text-transform: uppercase;
        }

        .header-section .bottom-content {
            padding: 25px 45px 20px 50px;
        }

        .main-content {
            padding: 0 45px;
        }

        .main-content .signature {
            max-width: 200px;
            width: 100%;
            margin-top: 60px;
            text-align: center;
        }
        .main-content .info-wrap{
            align-items: end;
        }

        .main-content .signature .sign {
            border-bottom: 2px solid #929597;
            display: inline-block;
            width: 100%;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .main-content .signature .name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .main-content .qr-code {
            align-items: end;
        }
        .main-content .box-wrap{
            // margin-top: 60px;
        }
        .main-content .box {
            border: 1px solid #929597;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 50%;
            font-size: 15px;
        }
        .footer-section {
            position: fixed;
            bottom: 45px;
            left: 0;
            right: 0;
            z-index: 99;
        }

        .footer-section .f-content {
            background-color: #85705b;
            justify-content: space-around;
            padding: 15px 0;
            color: #fff;
        }

        .footer-section .f-content .icon {
            margin-right: 6px;
        }
    </style>
</head>

<body>
    <header class="header-section">
        <div class="top-content d-flex">
            <div>
            <h2 class="main-title">
               Royal Bahamas Police
            </h2>
            <p class="mt-2">North Sound Road, George Town Cayman Islands, KY1-1208</p>
          </div>
            <div class="logo">
                <img src="@@department_logo@@" alt="">
            </div>
        </div>
        <div class="border"></div>
        <div class="bottom-content">
            <div class="d-flex justify-content-between ">
                <div><strong> Certificate No: <span>@@certificate_number@@</span></strong></div>
                <div><strong>Date: <span>@@certificate_created_date@@</span></strong></div>
            </div>
            <h2 class="main-title">Police Character Certificate</h2>
        </div>
    </header>

    @@main_body_content@@
    <div class="footer-section">
        <div class="f-content d-flex">
            <div class="d-flex">
                <span class="icon"><img src="./img/call.png" alt=""></span>
                @@department_phone_no@@
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/email.png" alt=""></span>
                @@department_email@@
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/web.png" alt=""></span>
                @@department_website@@
            </div>
        </div>
        <div class="border mt-3"></div>
    </div>

</body>

</html>`

const BCS_certifcate_template = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Birth Certificate</title>
    <style>
       @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        @page{
            margin: 20px;
        }

        body {
            font-family: "Lora", serif;
            margin: 0;
            padding: 0px 0 0 0;
            color: #575757;
            font-size: 18px;
            /* Increased base font size */
        }

        .page-border {
            border: 2px solid #dad7d8;
            height: calc(100vh); /* Adjust for margins and padding */
            box-sizing: border-box;
        }
    

        .main-title {
            font-size: 45px;
            color: #575757;
            letter-spacing: 1px;
            font-weight: 500;
            text-transform: uppercase;
        }

        .content {
            margin-top: 260px;
            page-break-inside: auto
        }
        .page {
            page-break-after: always;
        }
        .page:last-child {
            page-break-after: auto;
        }
        
        .header-section {
            position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            width: 100%;
            z-index: 99;
            padding-top: 20px;
            overflow: hidden;
        }
        .header-section .logo{
            text-align: center;
        }
        .header-section .logo img {
            max-width: 90px;
        }
        .header-section .sub-title{
            text-align: center;
            margin-top: 5px;
        }
        .header-section .main-title{
            text-align: center;
            display: inline-block;
            padding: 0 6px; 
            left: 50%;
            transform: translateX(-50%);
            position: relative;
            margin-top: 10px;
            z-index: 1;
        }
        .header-section .main-title::before{
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color:#fff;
            z-index: -1;
        }
        .header-section .main-title::after{
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            height: 8px;
            width:calc(100vw - 12px);
            border-top: 2px solid #e5e5e5;
            z-index: -2;
            border-bottom: 2px solid #e5e5e5;

        }

        .main-content {
            padding: 0 55px;
            width: 100%;
            height: 
        }
        .main-content .info-wrap{
            align-items: end;
        }
        .main-content .qr-code {
        position: absolute; /* Position relative to the page */
        bottom: 20px; /* Distance from the bottom of the page */
        right: 20px; /* Distance from the right of the page */
        display: flex;
        justify-content: end;
        }

        .main-content .qr-code img {
            height: 150px;
            width: 150px;
        }

        .content .title{
            display: inline-block;
            min-width: 275px;
        }
        table tr td{
            padding-bottom: 20px;
        }
        table tr:last-child td{
            padding-bottom: 0;
        }
        .header-top-text{
        padding:0 25px;
        display:flex;
            justify-content: space-between;
        }
    </style>
</head>

<body>
    <div class="page-border">
        <header class="header-section">
              <div class="bottom-content">
                <div class="header-top-text">
                    <div><strong> Certificate No: <span>@@certificate_number@@</span></strong></div>
                    <div><strong>Date: <span>@@certificate_created_date@@</span></strong></div>
                </div>
            </div>
            <div class="logo">
                <span>
                    <img src="@@department_logo@@" alt="logo">
                </span>
            </div>
            <div class="sub-title">Register General's Department</div>
            <h1 class="main-title">Birth Certificate</h1>
      
        </header>
        @@main_body_content@@
    </div>
</body>

</html>`

const serviceTemplates = [
    {
        serviceSlug: "nbl",
        serviceTemplate: NBL_certifcate_template,
    },
    {
        serviceSlug: "tcs",
        serviceTemplate: TCS_certifcate_template,
    },
    {
        serviceSlug: "pcs",
        serviceTemplate: PCS_certifcate_template,
    },
    {
        serviceSlug: "bcs",
        serviceTemplate: BCS_certifcate_template,
    },
];

module.exports = {
    serviceTemplates,
};
