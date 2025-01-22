import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import SimpleBar from "simplebar-react";
import NoImage from "../../../../assets/images/userIcon.webp";

const getStatusBadge = (status) => {
	const badgeClass = "badge p-1"; // Applied padding and used `badge` class only
	switch (status) {
		case "0":
			return <span className={`${badgeClass} bg-warning`}>Pending</span>;
		case "1":
			return <span className={`${badgeClass} bg-info`}>In Progress</span>;
		case "2":
			return <span className={`${badgeClass} bg-info`}>Escalated</span>;
		case "3":
			return <span className={`${badgeClass} bg-success`}>Closed</span>;
		case "4":
			return <span className={`${badgeClass} bg-primary`}>Reopened</span>;
		default:
			return <span className={`${badgeClass} bg-secondary`}>Unknown</span>;
	}
};

const TicketLogHistory = ({
	openModel,
	handleCloseModel,
	ticketLogs,
	formatDateString,
}) => {
	return (
		<Modal
			isOpen={openModel}
			toggle={handleCloseModel}
			id="staticBackdrop"
			size="lg"
			centered>
			<ModalHeader className="p-3 chat-modal">
				<div>
					<span className="icon">
						<i className="ri-history-line d-inline-block me-2"></i>
					</span>
					Ticket Logs History
				</div>
				<button
					type="button"
					className="btn-close"
					onClick={handleCloseModel}
					aria-label="Close"></button>
			</ModalHeader>
			<SimpleBar
				style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}>
				<ModalBody className="border border-dashed border-start-0 border-end-0">
					<div className="px-3 mx-n3">
						{ticketLogs.map((log, index) => (
							<div className="d-flex mb-4" key={index}>
								<div className="flex-shrink-0">
									<img
										src={
											(log?.customerId
												? log?.customer?.image
												: log?.userDetails?.image) || NoImage
										}
										alt="profile"
										className="rounded-circle avatar-xs me-2"
									/>
								</div>
								<div className="flex-grow-1 ms-3">
									<h5 className="fs-13">
										{log?.customerId
											? log?.customer?.name
											: log?.userDetails?.name}{" "}
										<small className="text-muted">
											{formatDateString(log?.createdDate)}
										</small>
									</h5>

									<p className="text-muted">{log?.description}</p>

									<div>
										{log?.oldStatus && log?.newStatus ? (
											<p className="mb-2">
												<strong>Status: </strong>
												<span className="text-muted">
													Old - {getStatusBadge(log.oldStatus)}
													<span className="text-primary mx-2">{" >> "}</span>
													New - {getStatusBadge(log.newStatus)}
												</span>
											</p>
										) : (
											<p className="mb-2">
												<strong>Status: </strong>
												<span className="text-muted">
													{log?.oldStatus
														? getStatusBadge(log.oldStatus)
														: getStatusBadge(log.newStatus)}
												</span>
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</ModalBody>
			</SimpleBar>
		</Modal>
	);
};

export default TicketLogHistory;
