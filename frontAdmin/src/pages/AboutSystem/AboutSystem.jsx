import React from 'react'

const AboutSystem= () => {
    document.title = "About System | eGov Solution"
    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">About System</h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 pe-4">
                                    <div className="row">
                                        <div className="col-12 col-md-5 col-xl-4">
                                            <div className="card">
                                                <div className="card-header bg-primary text-white">
                                                    General Infomation
                                                </div>
                                                <div className="card-body">
                                                    <table className="table table-striped">
                                                        <tbody>
                                                            <tr>
                                                                <td colSpan="2" ng-controller="accountsController">
                                                                    <label className="general-info-label updating-elements mb-0">Current User</label>
                                                                    <div className="general-info-value">controlbase</div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="app-stat-data">
                                                                    <label id="lblDomainName" className="general-info-label">
                                                                        Primary Domain
                                                                    </label>
                                                                    <div id="txtDomainName" className="general-info-value">
                                                                        <div className="sslValidationIconclassNamees fas fa-lock"></div>
                                                                        <div target="_blank" title="Preview">
                                                                            controlbase
                                                                            <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="app-stat-upgrade">
                                                                    <div>
                                                                        <div id="lnkMaintain_DomainName">
                                                                            <i id="imgMaintain_DomainName" className="fas fa-wrench fa-2x" aria-hidden="true"></i>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2">
                                                                    <label id="lblIPAddress" className="general-info-label">Shared IP Address</label>
                                                                    <div id="txtIPAddress" className="general-info-value">161.1.5.47</div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2">
                                                                    <label id="lblHomeDirectory" className="general-info-label">Home Directory</label>
                                                                    <div id="txtHomeDirectory" className="general-info-value">/home/controlbase</div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2">
                                                                    <label id="lblLastLogin" className="general-info-label">Last Login IP Address</label>
                                                                    <div id="txtLastLogin" className="general-info-value">15.12.23.14</div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card-header bg-primary text-white">
                                                    Server Information
                                                </div>
                                                <div className="card-body">
                                                    <table width="100%" id="cpanel_info_table" className="table table-striped">
                                                        <thead>
                                                            <tr id="cpanel_info_tableheader">
                                                                <th>Item</th>
                                                                <th>Detail</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="stats_left" id="stats_hostingpackage_text">Hosting Package</td>
                                                                <td className="stats_right" id="stats_hostingpackage_value">default</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_shorthostname_text">Server Name</td>
                                                                <td className="stats_right" id="stats_shorthostname_value">dragonball</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_cpanelversion_text">cPanel Version</td>
                                                                <td className="stats_right" id="stats_cpanelversion_value">104.0 (build 8)</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_apacheversion_text">Apache Version</td>
                                                                <td className="stats_right" id="stats_apacheversion_value">2.4.54</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_phpversion_text">PHP Version</td>
                                                                <td className="stats_right" id="stats_phpversion_value">7.0.33</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_mysqlversion_text">MySQL Version</td>
                                                                <td className="stats_right" id="stats_mysqlversion_value">5.7.39</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_machinetype_text">Architecture</td>
                                                                <td className="stats_right" id="stats_machinetype_value">x86_64</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_operatingsystem_text">Operating System</td>
                                                                <td className="stats_right" id="stats_operatingsystem_value">linux</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_sharedip_text">Shared IP Address</td>
                                                                <td className="stats_right" id="stats_sharedip_value">167.71.85.247</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_sendmailpath_text">Path to Sendmail</td>
                                                                <td className="stats_right" id="stats_sendmailpath_value">/usr/sbin/sendmail</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_perlpath_text">Path to Perl</td>
                                                                <td className="stats_right" id="stats_perlpath_value">/usr/bin/perl</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_perlversion_text">Perl Version</td>
                                                                <td className="stats_right" id="stats_perlversion_value">5.16.3</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="stats_left" id="stats_kernelversion_text">Kernel Version</td>
                                                                <td className="stats_right" id="stats_kernelversion_value">3.10.0-962.3.2.lve1.5.64.el7.x86_64</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-7 col-xl-8">
                                            <div className="row">
                                                <div className="col-12 col-sm-6 col-md-6 col-xl-3">
                                                    <div className="card card-animate mb-4 shadow-sm border-0 bg-soft-danger">
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <p className="fs-6 fw-medium text-black mb-0">Number of pages</p>
                                                                    <div className="d-flex">
                                                                        <h2 className="mt-3 ff-secondary fw-semibold fs-2">
                                                                            <div className="counter-value" data-target="398">398</div>
                                                                        </h2>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="avatar-xs flex-shrink-0">
                                                                        <div className="avatar-title bg-info rounded-circle fs-2">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-globe text-white icon-sm"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-md-6 col-xl-3">
                                                    <div className="card card-animate mb-4 shadow-sm border-0 bg-soft-info">
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <p className="fs-6 fw-medium text-black mb-0">Number of live links</p>
                                                                    <div className="d-flex">
                                                                        <h2 className="mt-3 ff-secondary fw-semibold fs-2">
                                                                            <div className="counter-value" data-target="398">398</div>
                                                                        </h2>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="avatar-xs flex-shrink-0">
                                                                        <div className="avatar-title bg-info rounded-circle fs-2">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-globe text-white icon-sm"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-md-6 col-xl-3">
                                                    <div className="card card-animate mb-4 shadow-sm border-0 bg-soft-success">
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <p className="fs-6 fw-medium text-black mb-0">Number of fillable forms</p>
                                                                    <div className="d-flex">
                                                                        <h2 className="mt-3 ff-secondary fw-semibold fs-2">
                                                                            <div className="counter-value" data-target="4">4</div>
                                                                        </h2>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="avatar-xs flex-shrink-0">
                                                                        <div
                                                                            className="avatar-title bg-success rounded-circle fs-2">
                                                                            <i data-feather="file" className="text-white icon-sm"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-md-6 col-xl-3">
                                                    <div className="card card-animate mb-4 shadow-sm border-0 bg-soft-warning">
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <p className="fs-6 fw-medium text-black mb-0">Number of PDF forms</p>
                                                                    <div className="d-flex">
                                                                        <h2 className="mt-3 ff-secondary fw-semibold fs-2">
                                                                            <div className="counter-value" data-target="11">11</div>
                                                                        </h2>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="avatar-xs flex-shrink-0">
                                                                        <div
                                                                            className="avatar-title bg-warning rounded-circle fs-2">
                                                                            <i data-feather="file" className="text-white icon-sm"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card border-0 bg-transparent">
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <div className="card mt-2">
                                                            <div className="card-body">
                                                                <h6 className="card-title">Web Platforms</h6>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Laravel.svg/1200px-Laravel.svg.png" alt="Apache"  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Laravel.svg/1200px-Laravel.svg.png" height="50px" /><div className="text-dark">Laravel</div><sup className="ms-2">9.0.0</sup></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d1.awsstatic.com/asset-repository/products/amazon-rds/1024px-MySQL.ff87215b43fd7292af172e2a5d9b844217262571.png" alt="nginx" src="https://d1.awsstatic.com/asset-repository/products/amazon-rds/1024px-MySQL.ff87215b43fd7292af172e2a5d9b844217262571.png" height="50px" /><div className="text-dark">MySQL</div><sup className="ms-2">8.0.30</sup></h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card mt-4">
                                                            <div className="card-body">
                                                                <h6 className="card-title">Web Servers</h6>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d1nywwyphm5jsu.cloudfront.net/thumb/00-8j-10-j2-dj-06/n" alt="Apache" src="https://d1nywwyphm5jsu.cloudfront.net/thumb/00-8j-10-j2-dj-06/n" /><div className="text-dark">Apache</div></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d3c1mi4ekssrlm.cloudfront.net/thumb/ed-87-1z-jq-j9-86/n" alt="nginx" src="https://d3c1mi4ekssrlm.cloudfront.net/thumb/ed-87-1z-jq-j9-86/n" /><div className="text-dark">nginx</div></h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card mt-4">
                                                            <div className="card-body">
                                                                <h6 className="card-title">Content Delivery Network</h6>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://deo39crpw7zzn.cloudfront.net/thumb/ee-d6-z4-q2-dz-21/n" alt="Content Delivery Network" src="https://deo39crpw7zzn.cloudfront.net/thumb/ee-d6-z4-q2-dz-21/n" /><div className="text-dark">Content Delivery Network</div></h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card mt-4">
                                                            <div className="card-body">
                                                                <h6 className="card-title">Web Hosting Providers</h6>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d3c1mi4ekssrlm.cloudfront.net/thumb/3j-98-9q-22-00-2d/n" alt="Digital Ocean" src="https://d3c1mi4ekssrlm.cloudfront.net/thumb/3j-98-9q-22-00-2d/n" /><div className="text-dark">Digital Ocean</div></h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card mt-4">
                                                            <div className="card-body">
                                                                <h6 className="card-title">SSL Certificates</h6>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://dbuflkpcdpfh3.cloudfront.net/thumb/31-16-34-6q-0j-q8/n" alt="LetsEncrypt" src="https://dbuflkpcdpfh3.cloudfront.net/thumb/31-16-34-6q-0j-q8/n" /><div className="text-dark">LetsEncrypt</div></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d2uu9ep1796sii.cloudfront.net/thumb/1c-de-dc-4e-76-9c/n" alt="SSL by Default" src="https://d2uu9ep1796sii.cloudfront.net/thumb/1c-de-dc-4e-76-9c/n" /><div className="text-dark">SSL by Default</div></h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card mt-4">
                                                            <div className="card-body">
                                                                <h6 className="card-title">JavaScript Libraries and Functions</h6>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d3dpwkknyrpnnn.cloudfront.net/thumb/78-jd-31-5d-34-06/n" alt="Facebook for Websites" src="https://d3dpwkknyrpnnn.cloudfront.net/thumb/78-jd-31-5d-34-06/n" /><div className="text-dark">Facebook for Websites</div></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d2uu9ep1796sii.cloudfront.net/thumb/57-j1-ec-41-c9-3d/n" alt="Bootstrap.js" src="https://d2uu9ep1796sii.cloudfront.net/thumb/57-j1-ec-41-c9-3d/n" /><div className="text-dark">Bootstrap.js</div></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d3nsmo0b6ncuv0.cloudfront.net/img/icons/blank.png" alt="Slick JS" src="https://d3nsmo0b6ncuv0.cloudfront.net/img/icons/blank.png" /><div className="text-dark">Slick JS</div></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d3dpwkknyrpnnn.cloudfront.net/thumb/4d-7c-6j-dq-0d-qe/n" alt="GSAP" src="https://d3dpwkknyrpnnn.cloudfront.net/thumb/4d-7c-6j-dq-0d-qe/n" /><div className="text-dark">GSAP</div></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d2uu9ep1796sii.cloudfront.net/thumb/83-27-07-e6-5j-91/n" alt="Fancybox"  src="https://d2uu9ep1796sii.cloudfront.net/thumb/83-27-07-e6-5j-91/n" /><div className="text-dark">Fancybox</div></h4>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-12">
                                                                        <h4 className="d-flex align-items-center"><img className="me-3 align-top ll stdmic visible" data-src="https://d2uu9ep1796sii.cloudfront.net/thumb/dq-e6-55-cq-c8-69/n" alt="Popper.js" src="https://d2uu9ep1796sii.cloudfront.net/thumb/dq-e6-55-cq-c8-69/n" /><div className="text-dark">Popper.js</div></h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="btn btn-danger btn-icon" id="back-to-top">
                    <i className="ri-arrow-up-line"></i>
                </button>
            </div>
        </>
    )
}
export default AboutSystem;