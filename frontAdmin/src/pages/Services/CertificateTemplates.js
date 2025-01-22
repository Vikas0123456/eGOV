const NBL_certifcate_template = `<!DOCTYPE html>
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
            // margin-top: 310px;
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
            // position: fixed;
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
                <div>Certificate No: <span>1234</span></div>
                <div>Date: <span>00/00/00</span></div>
            </div>
            <h2 class="main-title">Business License Certificate</h2>
        </div>
    </header>
    <main class="main-content">
        <div class="content page">
            <div class="mb-1"> <strong>License Number:</strong> <span>12345</span></div>
            <div class="mb-1"><strong>Issue Date:</strong> <span>00/00/00</span></div>
            <div class="mb-1"><strong>Expires:</strong> <span>00/00/00</span></div>
            <div class="text mt-4">
                <p>This certifies that the business named herein has been registered under the Business License Act and
                    has been granted permission to operate within the jurisdiction of the Commonwealth of The Bahamas
                    subject to the conditions of the Act and any other relevant regulations.</p>
                <p>
                    Application For: New Business License License Specifics: Annual Business Licence
                    License/Certification Number: 85-854-456-888 Issuing Authority: Department of Inland Revenue,
                    Bahamas
                </p>
                <div class="mb-1 mt-4">
                    <strong>
                        Business Information:
                    </strong>
                </div>
                <div class="mb-1"><strong>Business Name: </strong>Netclues Limited</div>
                <div class="mb-1"><strong>Business Type: </strong>Manufacturing</div>
                <div class="mb-1"><strong>Business Structure: </strong>Limited Partnership (LP)</div>
                <div class="mb-1"><strong>Business Address: </strong>North Sound Road 122 Cannon Place, George Town, KY1-1208, Cayman Islands</div>
                <div class="mb-1"><strong>Description of Business Activities: </strong>Renovation</div>
                <div class="mb-1"><strong>Purpose: </strong>Renovation</div>
                <div class="mb-1 mt-4">
                    <strong>
                        Ownership Information:
                    </strong>
                </div>
                <div class="mb-1"><strong>Owner's Full Name: </strong>Kartik Mehta</div>
                <div class="mb-1"><strong>Owner's Address: </strong>North Sound Road 122 Cannon Place, George Town, KY1-1208, Cayman Islands</div>
                <div class="mb-1"><strong>Telephone Number: </strong>(647) 648-2233</div>
                <div class="mb-1"><strong>Email Address: </strong>kartik@netclues.com</div>
                <div class="mb-1"><strong>Telephone Number: </strong>(647) 648-2233</div>
                <div class="mb-1 mt-4">
                    <strong>
                        State/Federal Identifiers:
                    </strong>
                </div>
                <div class="mb-1"><strong>Employer Identification Number (EIN): </strong>56-2307147</div>
                <div class="mb-1"><strong> State Tax ID Number: </strong>LCL-R98765432</div>
            </div>
        </div>
        <div class="content page">
           
            <div class="mb-1"><strong>Start Date of Business: </strong> 25 Apr 2008 Anticipated Annual Revenue: $50,000</div>
            <div class="mb-1"><strong>Number of Employees: </strong>30</div>
            <div class="mb-1 mt-4">
                <strong>
                    Emergency Contact:
                </strong>
            </div>
            <div class="mb-1"><strong>Name: </strong>Krish</div>
            <div class="mb-1"><strong>Phone Number: </strong>(647) 648-2233</div>
            <div class="mb-1"><strong>Relationship to Business: </strong>Partnership</div>
            <div class="mb-1 mt-4"><strong>Certification: </strong> This license is granted upon the condition that the business complies with all regulations pertaining to its category and pays all due taxes and fees. This license must be displayed prominently at the place of business.</div>
            <div class="mt-4 signature">
                <span class="sign">
                <img src="./img/signature.png" alt="">
             </span>
            <div class="name"> Officer Incharge Signature</div>
             <span class="logo">
                <img src="./img/logo2.png" alt="">
             </span>
            </div>
            <div class="box-wrap d-flex justify-content-between">
             <div class="box">
                <div><strong>Issuing Officer's Name: </strong>Lorem Ipsum</div>
                <div><strong>Title: </strong>Lorem</div>
                <div><strong>Signature: </strong>Lorem Ipsum</div>
                <div><strong>Official Stamp: </strong>Lorem Ipsum</div>
             </div>
             <div class="qr-code">
                <span><img src="./img/qrcode.png" alt=""></span>
             </div>
            </div>
        </div>
    </main>
    <div class="footer-section">
     <div class="f-content d-flex">
        <div class="d-flex">
            <span class="icon"><img src="./img/call.png" alt=""></span>
             +23 998 456789
        </div>
        <div class="d-flex">
            <span class="icon"><img src="./img/email.png" alt=""></span>
             contect@gmail.com
        </div>
        <div class="d-flex">
            <span class="icon"><img src="./img/web.png" alt=""></span>
             loremipsum.com
        </div>
     </div>
     <div class="border mt-3"></div>
    </div>

</body>

</html>`

const TCS_certifcate_template = `
<!DOCTYPE html>
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
            // margin-top: 265px;
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
            top: 0px;
            left: 0px;
            right: 0px;
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
            // position: fixed;
            // bottom: 45px;
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
                <div><strong> Certificate No: <span>1234</span></strong></div>
                <div><strong>Date: <span>00/00/00</span></strong></div>
            </div>
            <h2 class="main-title">Tax Compliance certificate</h2>
        </div>
    </header>


    <main class="main-content">
        <div class="content page">
            <div class="mb-1 mt-4">
                    To Whom It May Concern:
            </div>
            <div class="text">
                <p>This is to certify that Mr. Kartik Mehta, residing at 122 Cannon Place, North Sound Road, George
                    Town, CAYMAN ISLANDS, KY1-1208, and holding the Taxpayer Identification Number TBN27357802, has
                    fulfilled all the necessary tax obligations as per the available records of the Department of
                    Taxation of the Cayman Islands Government up to the date of this certificate.</p>

                <div class="mb-1 mt-3">
                    <strong>
                        Taxpayer Details:
                    </strong>
                </div>
                <ul class="mb-3">
                    <li class="mb-1">Name: Kartik Mehta</li>
                    <li class="mb-1">Address: 122 Cannon Place, North Sound Road, George Town, CAYMAN ISLANDS, KYI-1208</li>
                    <li class="mb-1">Taxpayer Identification Number: TBN27357802</li>
                </ul>
                <p>According to the records of the Department of Taxation for the period ending [last date of tax period
                    covered], there have been no delinquent taxes, interest, or penalties due or outstanding for the
                    above-named individual.</p>
                <p>
                    This certificate has been issued for the purpose of [specify the purpose, such as business
                    licensing, loan application, etc.] and is valid for [specify the period of validity, eg, six months,
                    one year, etc.] from the date of issue. This certificate is not an exemption of any future taxes
                    that may become due by the above-named taxpayer and does not preclude any ongoing or future audits
                    or investigations.
                </p>
                <p>For verification or further information regarding this certification, please contact the Department
                    of Taxation.</p>
            </div>

            <div class="info-wrap mt-3 d-flex justify-content-between">
                <div class="mt-4 signature">
                    <span class="sign">
                        <img src="./img/signature.png" alt="">
                    </span>
                    <div class="name"> Officer Incharge Signature</div>
                    <span class="logo">
                        <img src="./img/logo2.png" alt="">
                    </span>
                </div>
                <div class="box-wrap">

                    <div class="qr-code">
                        <span><img src="./img/qrcode.png" alt=""></span>
                    </div>
                    <div class="box mt-3">
                        <div><strong>Issuing Officer's Name: </strong>Lorem Ipsum</div>
                        <div><strong>Title: </strong>Lorem</div>
                        <div><strong>Signature: </strong>Lorem Ipsum</div>
                        <div><strong>Official Stamp: </strong>Lorem Ipsum</div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <div class="footer-section">
        <div class="f-content d-flex">
            <div class="d-flex">
                <span class="icon"><img src="./img/call.png" alt=""></span>
                +23 998 456789
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/email.png" alt=""></span>
                contect@gmail.com
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/web.png" alt=""></span>
                loremipsum.com
            </div>
        </div>
        <div class="border mt-3"></div>
    </div>

</body>

</html>`

const PCS_certificate_template =`<!DOCTYPE html>
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
            // position: fixed;
            // bottom: 45px;
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
                <div><strong> Certificate No: <span>0250</span></strong></div>
                <div><strong>Date: <span>25/10/00</span></strong></div>
            </div>
            <h2 class="main-title">Police Character Certificate</h2>
        </div>
    </header>
    <main class="main-content">
        <div class="content page">
            <div class="text mt-5">
                <p>
                    This is to certify that as at 9th November 2003 there is know convictions recorded in the criminal database of this Island against the bearer, Mr. Kartik Mehta, DOB: 24/03/1980, possessor of Cayman Islands Passport Number TBN27357802, residing at 122 Cannon Place, North Sound Road, George Town, CAYMAN ISLANDS, KYI-1208.
                </p>
                <p>
                    According to the records checked for the period [insert the number of years checked], no criminal convictions have been found against Mr. Kartik Mehta in the Cayman Islands. This certificate does not provide any assessment of character but is an indication that, as of the date above, Mr. Kartik Mehta has not been registered with any criminal convictions in the Royal Bahamas Police Service database.
                </p>
            </div>
            <div class="info-wrap d-flex justify-content-between">
                <div class="signature">
                    <span class="sign">
                        <img src="./img/signature.png" alt="">
                    </span>
                    <div class="name"> Officer Incharge Signature</div>
                    <span class="logo">
                        <img src="./img/logo2.png" alt="">
                    </span>
                </div>
                <div class="qr-code">
                    <span><img src="./img/qrcode.png" alt=""></span>
                </div>
            </div>
            <div class="box-wrap">
                <div class="box">
                    <div><strong>Issuing Officer's Name: </strong>Lorem Ipsum</div>
                    <div><strong>Title: </strong>Lorem</div>
                    <div><strong>Signature: </strong>Lorem Ipsum</div>
                    <div><strong>Official Stamp: </strong>Lorem Ipsum</div>
                </div>
            </div>
        </div>
    </main>
    <div class="footer-section">
        <div class="f-content d-flex">
            <div class="d-flex">
                <span class="icon"><img src="./img/call.png" alt=""></span>
                +23 998 456789
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/email.png" alt=""></span>
                contect@gmail.com
            </div>
            <div class="d-flex">
                <span class="icon"><img src="./img/web.png" alt=""></span>
                loremipsum.com
            </div>
        </div>
        <div class="border mt-3"></div>
    </div>

</body>

</html>`

const BCS_certificate_template = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Police Certificate</title>
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
            margin-top: 100px;
            page-break-inside: auto
        }
        .page {
            page-break-after: always;
        }
        .page:last-child {
            page-break-after: auto;
        }
        
        .header-section {
            // position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            width: 100%;
            z-index: 99;
            padding-top: 35px;
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
        }

        .main-content .info-wrap{
            align-items: end;
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

    </style>
</head>

<body>
<div class="page-border">
    <header class="header-section">
            <div class="logo">
                <span>
                <img src="@@department_logo@@" alt="">
             </span>
            </div>
            <div class="sub-title">Register General's Department</div>
            <h1 class="main-title">Birth Certificate</h1>
    </header>
    <main class="main-content">
        <div class="content page">
            <table>
                <tbody>
                    <tr>
                        <td><span class="title">Name of Child:</span></td>
                        <td>Krish Kartik Mehta</td>
                    </tr>
                    <tr>
                        <td><span class="title">Gender:</span></td>
                        <td>Male</td>
                    </tr>
                    <tr>
                        <td><span class="title">Date of Birth:</span></td>
                        <td>25 Apr, 2008</td>
                    </tr>
                    <tr>
                    <td><span class="title">Place of Birth:</span></td>
                    <td>Grand Cayman</td>
                </tr>
                <tr>
                    <td><span class="title">Born at (institution):</span></td>
                    <td>Prediatrics & Newborn Medicine</td>
                </tr>
                <tr>
                    <td><span class="title">Father's full name:</span></td>
                    <td>Kartik Nikhil Mehta</td>
                </tr>
                <tr>
                    <td><span class="title">Mother's full Name:</span></td>
                    <td>Michelle Kartik Mehta</td>
                </tr>
                <tr>
                    <td><span class="title">Mother's maiden name:</span></td>
                    <td>vaz</td>
                </tr>
                <tr>
                    <td><span class="title">Address:</span></td>
                    <td>122 Cannon Place, North Sound Road, George Town, Cayman Islands KY1-1208</td>
                </tr>
                    
                </tbody>
            </table>
        </div>
    </main>
    </div>
</body>

</html>`

export const serviceTemplates = [
    {
        serviceSlug: "nbl",
        serviceTemplate : NBL_certifcate_template
    },
    {
        serviceSlug: "tcs",
        serviceTemplate : TCS_certifcate_template
    },
    {
        serviceSlug: "pcs",
        serviceTemplate : PCS_certificate_template
    },
    {
        serviceSlug: "bcs",
        serviceTemplate : BCS_certificate_template
    }
]

