import {
	addEdge,
	ReactFlow,
	useEdgesState,
	useNodesState,
	BaseEdge,
	getSmoothStepPath,
	Background,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import {
	Button,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Spinner,
} from "reactstrap";
import { decrypt } from "../../../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../../../utils/hook/useAxios";
import CustomNode from "./CustomNode";
import "./Flow.css"; // Import CSS styles

const AnimatedSVGEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}) => {
	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	return (
		<>
			<BaseEdge id={id} path={edgePath} />
			<circle r="4" fill="#DF4F43">
				<animateMotion dur="5s" repeatCount="indefinite" path={edgePath} />
			</circle>
		</>
	);
};

const NODE_TYPES = {
	MAIN: "main",
	DEPARTMENT: "department",
	SERVICE: "service",
	ACTIONS: "actions",
	SERVICE_METHOD: "serviceMethod",
	ROLE_LIST: "roleList",
	ROLES_WISE_USERS: "rolesWiseUsers",
	USER_LIST: "userList",
	TAT: "tat",
};

const NODE_POSITIONS = {
	MAIN: { x: 0, y: 50 },
	DEPARTMENT: { x: 220, y: 50 },
	SERVICE: { x: 440, y: 50 },
	ACTIONS: { x: 660, y: 50 },
	SERVICE_METHOD: { x: 440, y: 650 },
	ROLE_LIST: { x: 660, y: 650 },
	ROLES_WISE_USERS: { x: 660, y: 650 },
	USER_LIST: { x: 880, y: 650 },
	TAT: { x: 1100, y: 650 },
};

const serviceMethodOptions = [
	{ value: "0", label: "Role" },
	{ value: "1", label: "Agents" },
];

const createNode = ({
	id,
	type = "custom",
	name,
	job,
	emoji,
	position,
	onClick = false,
}) => ({
	id,
	type,
	data: {
		name,
		job,
		emoji,
		label: name,
		onClick,
	},
	position,
});

const createEdge = (source, target, type = "animatedSvg") => ({
	id: `edge-${source}-${target}`,
	source,
	target,
	type,
	// animated: true,
});

const calculateNodePosition = (
	index,
	baseX = 900,
	baseY = 50,
	offsetY = 300
) => {
	return {
		x: baseX,
		y: baseY + index * offsetY,
	};
};

const edgeTypes = {
	animatedSvg: AnimatedSVGEdge,
};

const initialNodes = [
	createNode({
		id: NODE_TYPES.MAIN,
		name: "Start Workflow",
		job: "Select Action",
		emoji: "🛠️",
		position: NODE_POSITIONS.MAIN,
		onClick: true,
	}),
];

const Flow = () => {
	const axiosInstance = useAxios();
	const userEncryptData = localStorage.getItem("userData");
	const userDecryptData = userEncryptData
		? decrypt({ data: userEncryptData })
		: {};
	const userData = userDecryptData?.data;
	const userId = userData?.id;

	const navigate = useNavigate();
	const location = useLocation();
	const workflow = location?.state;
	const workflowDataFromState = workflow && JSON.parse(workflow?.workflowData);
	const workflowId = workflow?.id;

	const [workflowData, setWorkflowData] = useState(
		workflowDataFromState
			? workflowDataFromState?.workflowData
			: {
					workflowName: "",
					workflowFor: "",
					departmentId:
						userData?.isCoreTeam === "0" ? Number(userData?.departmentId) : "",
					services: [],
					actions: [],
					actionsData: {},
			  }
	);

	const [nodes, setNodes, onNodesChange] = useNodesState(
		workflowDataFromState?.nodes || initialNodes
	);
	const [edges, setEdges, onEdgesChange] = useEdgesState(
		workflowDataFromState?.edges || []
	);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState(null);
	const [validationError, setValidationError] = useState("");
	const [departments, setDepartments] = useState([]);
	const [services, setServices] = useState([]);
	const [userLists, setUserLists] = useState([]);
	const [supportTeamUsers, setSupportTeamUsers] = useState([]);
	const [roleLists, setRoleLists] = useState([]);
	const [supportRoleLists, setSupportRoleLists] = useState([]);
	const [prevWorkflows, setPrevWorkflows] = useState([]);
	const [workflowActions, setWorkflowActions] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Create and update workflow api
	const createWorkflowApi = async (updatedNodes) => {
		try {
			const workflow = {
				workflowId: workflowId || null,
				workflowName: workflowData?.workflowName,
				userId: userId,
				workflowFor: workflowData?.workflowFor,
				workflowDepartmentId: workflowData?.departmentId,
				workflowServiceSlug: JSON.stringify(workflowData?.services || []),
				workflowData: JSON.stringify({
					workflowData,
					nodes: updatedNodes,
					edges,
				}),
			};
			setIsSubmitting(true);
			const response = await axiosInstance.post(
				`userService/workflow/create-workflow`,
				workflow
			);

			if (response?.data) {
				setIsSubmitting(false);
				navigate("/workflow");
				if (workflowId) {
					toast.success("Workflow updated successfully.");
				} else {
					toast.success("Workflow added successfully.");
				}
			}
		} catch (error) {
			setIsSubmitting(false);
			console.error(error.message);
			toast.error("Something went worng while adding workflow.");
		}
	};

	// Get previous workflows to exclude services from the list
	const getPrevWorkflows = async (departmentId, workflowId, workflowFor) => {
		try {
			const response = await axiosInstance.post(
				`userService/workflow/prev-service`,
				{
					departmentId: departmentId,
					workflowId: workflowId || null,
					workflowFor: workflowFor,
				}
			);

			if (response?.data) {
				const { serviceIds } = response?.data?.data;
				setPrevWorkflows(serviceIds);
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	// Get workflow actions based on service or ticket
	const getWorkflowActions = async (actionFor) => {
		try {
			if (!actionFor) return;
			const response = await axiosInstance.post(
				`userService/workflow/getWorkflowActions`,
				{
					actionFor,
				}
			);

			if (response?.data) {
				const { rows } = response?.data?.data;
				setWorkflowActions(rows);
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	useEffect(() => {
		if (workflowId && workflowData?.departmentId) {
			getServiceList(workflowData.departmentId);
			fetchDeptUserList(workflowData.departmentId);
			fetchRoleList(workflowData.departmentId);
			getWorkflowActions(workflowData?.workflowFor);
			getPrevWorkflows(
				workflowData?.departmentId,
				workflowId,
				workflowData?.workflowFor
			);
			if (workflowData?.workflowFor === "1") {
				fetchSupportRoleList();
			}
		}
	}, [workflowId]);

	useEffect(() => {
		getDepartmentList();
		if (userData?.isCoreTeam === "0" && !workflowId) {
			getServiceList(userData?.departmentId);
			fetchDeptUserList(userData?.departmentId);
			fetchRoleList(userData?.departmentId);
		}
	}, []);

	const getDepartmentList = async () => {
		try {
			const response = await axiosInstance.post(
				`serviceManagement/department/view`,
				{}
			);
			if (response?.data) {
				const { rows } = response.data.data;
				setDepartments(rows);
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	const getServiceList = async (departmentId) => {
		try {
			const serviceResponse = await axiosInstance.post(
				`serviceManagement/service/view`,
				{ departmentId }
			);
			if (serviceResponse?.data) {
				const { rows } = serviceResponse.data.data;
				setServices(rows);
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	const fetchDeptUserList = async (departmentId) => {
		try {
			const response = await axiosInstance.post(`userService/user/view`, {
				departmentId: [departmentId],
				isSupportTeam: workflowData?.workflowFor === "0" ? "0" : "",
			});
			if (response?.data) {
				const { rows } = response.data.data;
				if (rows.length > 0) {
					const supportTeamUsers = rows.filter(
						(user) => user?.isSupportTeam === "1"
					);
					const agents = rows.filter((user) => user?.isSupportTeam === "0");
					setUserLists(agents);
					setSupportTeamUsers(supportTeamUsers);
				} else {
					setUserLists([]);
					setSupportTeamUsers([]);
				}
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	const fetchRoleList = async (departmentId) => {
		try {
			const response = await axiosInstance.post(`userService/roles/view`, {
				departmentId,
			});
			if (response?.data) {
				const { rows } = response.data.data;
				setRoleLists(rows);
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	const fetchSupportRoleList = async () => {
		try {
			const response = await axiosInstance.post(`userService/roles/view`, {
				isSupportTeam: "1",
			});
			if (response?.data) {
				const { rows } = response.data.data;
				setSupportRoleLists(rows);
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	const departmentOptions =
		(departments?.length > 0 &&
			departments.map((deparment) => ({
				value: deparment.id,
				label: deparment.departmentName,
			}))) ||
		[];

	const actionOptions =
		(workflowActions?.length > 0 &&
			workflowActions.map((action) => ({
				value: action.actionSlug,
				label: action.actionName,
			}))) ||
		[];

	const usersOptions =
		(userLists?.length > 0 &&
			userLists.map((user) => ({
				value: user.id,
				label: user.name,
			}))) ||
		[];

	const supportTeamUsersOptions =
		(supportTeamUsers?.length > 0 &&
			supportTeamUsers.map((user) => ({
				value: user.id,
				label: user.name,
			}))) ||
		[];

	const rolesOptions =
		(roleLists?.length > 0 &&
			roleLists?.map((role) => ({
				value: role.id,
				label: role.roleName,
			}))) ||
		[];

	const supportRolesOptions =
		(supportRoleLists?.length > 0 &&
			supportRoleLists?.map((role) => ({
				value: role.id,
				label: role.roleName,
			}))) ||
		[];

	// ** Handling the workflowFor change ** //
	// This is to handle the workflowFor change and reset the nodes and edges if service or ticket selected //

	const handleWorkflowForChange = (selectedOption) => {
		// Early return if no selection
		if (!selectedOption) return;

		const isNonCoreTeam = userData?.isCoreTeam === "0";
		const shouldFetchRoles = selectedOption === "1";

		// Common actions to perform regardless of workflow state
		const performCommonActions = () => {
			getWorkflowActions(selectedOption);
			if (shouldFetchRoles) {
				fetchSupportRoleList();
			}
			if (isNonCoreTeam) {
				getPrevWorkflows(userData?.departmentId, workflowId, selectedOption);
			}
		};

		// Initial workflow setup
		if (!workflowData.workflowFor) {
			setWorkflowData((prevData) => ({
				...prevData,
				workflowFor: selectedOption,
			}));
			performCommonActions();
			return;
		}

		// Return if no change in workflow type
		if (selectedOption === workflowData.workflowFor) return;

		// Reset workflow state
		setNodes(initialNodes);
		setEdges([]);
		setWorkflowData((prevData) => ({
			...prevData,
			workflowFor: selectedOption,
			departmentId: isNonCoreTeam ? Number(userData?.departmentId) : "",
			services: [],
			actions: [],
			actionsData: {},
		}));

		// Add department node
		addNodeAndEdge(NODE_TYPES.MAIN, {
			id: NODE_TYPES.DEPARTMENT,
			name: "Department",
			job: "Department Selection",
			emoji: "🔗",
			position: NODE_POSITIONS.DEPARTMENT,
			onClick: true,
		});

		// Add service node for non-core team
		if (isNonCoreTeam) {
			addNodeAndEdge(NODE_TYPES.DEPARTMENT, {
				id: NODE_TYPES.SERVICE,
				name: "Service",
				job: "Service Selection",
				emoji: "🔧",
				position: NODE_POSITIONS.SERVICE,
				onClick: true,
			});
		}

		performCommonActions();
	};

	// ** Handling the department change ** //
	// This is to handle the department change and reset the data and fetch the services, users, and roles //

	const handleDepartmentChange = async (selectedOption) => {
		if (!selectedOption) return;

		if (selectedOption !== workflowData.departmentId) {
			setWorkflowData((prevWorkflowData) => ({
				...prevWorkflowData,
				departmentId: selectedOption,
				services: [],
				actionsData: Object.keys(prevWorkflowData.actionsData).reduce(
					(acc, key) => {
						acc[key] = {
							...prevWorkflowData.actionsData[key],
							serviceMethod: "",
							roles: "",
							rolesWiseUsers: [],
							users: [],
							TAT: "",
							maxPriorityLimit: "",
						};
						return acc;
					},
					{}
				),
			}));

			try {
				await Promise.all([
					getServiceList(selectedOption),
					fetchDeptUserList(selectedOption),
					fetchRoleList(selectedOption),
					getPrevWorkflows(
						selectedOption,
						workflowId,
						workflowData.workflowFor
					),
				]);
			} catch (error) {
				console.error("Error updating department data:", error);
			}
		}
	};

	const validateAndAddNode = (nodeType, requiredFields) => {
		setValidationError("");

		if (!nodeType || !requiredFields?.length) {
			return { createNode: false, requiredFields: false };
		}

		const nodeExists = nodes.some((node) => node.id === nodeType);

		const getNestedValue = (obj, path) => {
			const value = path.split(".").reduce((acc, key) => acc?.[key], obj);
			return Array.isArray(value)
				? value.length > 0
				: value != null && value !== "";
		};

		const hasAllRequiredFields = requiredFields.every((field) =>
			getNestedValue(workflowData, field)
		);

		return {
			createNode: !nodeExists,
			requiredFields: !hasAllRequiredFields,
		};
	};

	const addNodeAndEdge = (parentId, nodeConfig) => {
		const newNode = createNode(nodeConfig);
		const newEdge = createEdge(parentId, newNode.id);

		setNodes((nds) => [...nds, newNode]);
		setEdges((eds) => [...eds, newEdge]);

		return newNode.id;
	};

	const removeNodeAndEdge = (nodeId) => {
		setNodes((nds) => nds.filter((n) => n.id !== nodeId));
		setEdges((eds) =>
			eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
		);
	};

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[]
	);

	const handleNodeClick = (nodeId) => {
		setModalContent(nodeId);
		setModalOpen(true);
	};

	const validateNodes = (nodes, workflowData) => {
		const {
			workflowName,
			workflowFor,
			departmentId,
			services,
			actions,
			actionsData,
		} = workflowData;

		const isInvalid = (value) =>
			Array.isArray(value) ? value.length === 0 : value == null || value === "";

		const requiredChildNodesMap = {
			1: ["serviceMethod", "userList", "tat"], // Agent-based
			0: ["serviceMethod", "roleList", "rolesWiseUsers", "tat"], // Role-based
		};

		// Define the expected sequence of nodes
		const nodeSequence = ["main", "department", "service", "actions"];

		// Helper function to check if next node exists
		const hasNextNode = (currentNodeId) => {
			const currentIndex = nodeSequence.indexOf(currentNodeId);
			if (currentIndex === -1 || currentIndex === nodeSequence.length - 1)
				return true;

			const nextNodeId = nodeSequence[currentIndex + 1];
			return nodes.some((node) => node.id === nextNodeId);
		};

		// Validate current node's data
		const validateNodeData = (nodeId) => {
			switch (nodeId) {
				case "main":
					return isInvalid(workflowName) || isInvalid(workflowFor);
				case "department":
					return isInvalid(departmentId);
				case "service":
					return isInvalid(services);
				case "actions":
					if (isInvalid(actions)) return true;

					// Check if all selected action nodes exist
					const allActionNodesExist = actions.every((action) =>
						nodes.some((node) => node.id === action.value)
					);

					if (!allActionNodesExist) return true;

					// Check if all actions have their respective child nodes
					const hasValidChildren = actions.every((action) => {
						const actionId = action.value;
						const childNodes = nodes.filter((node) =>
							node.id.startsWith(`${actionId}_`)
						);
						return childNodes.length > 0;
					});

					if (!hasValidChildren) return true;

					// Ensure there are no orphan nodes
					const orphanNodesExist = nodes.some((node) => {
						// Check if the node is a child node (contains '_')
						if (node.id.includes("_")) {
							const parentActionId = node.id.split("_")[0];
							// Validate that the parent action exists in the actions list
							return !actions.some((action) => action.value === parentActionId);
						}
						return false; // Skip nodes that are not children
					});

					return orphanNodesExist;

				default:
					return false;
			}
		};

		// Validate child nodes of an action
		const validateActionChild = (nodeId, actionData) => {
			if (!actionData) return true;

			const [_, fieldKey] = nodeId.split("_");
			const {
				serviceMethod,
				users,
				maxPriorityLimit,
				TAT,
				roles,
				rolesWiseUsers,
			} = actionData;

			switch (fieldKey) {
				case "serviceMethod":
					return isInvalid(serviceMethod);
				case "userList":
					return isInvalid(users) || isInvalid(maxPriorityLimit);
				case "tat":
					return isInvalid(TAT);
				case "roleList":
					return isInvalid(roles);
				case "rolesWiseUsers":
					return isInvalid(rolesWiseUsers) || isInvalid(maxPriorityLimit);
				default:
					return false;
			}
		};

		// Validate a parent action node
		const validateParentAction = (actionId, actionData) => {
			if (!actionData) return true;

			const requiredNodes = requiredChildNodesMap[actionData.serviceMethod];
			if (!requiredNodes) return true;

			// Check if the next required child node exists
			const existingChildNodes = nodes
				.filter((node) => node.id.startsWith(`${actionId}_`))
				.map((node) => node.id.split("_")[1]);

			const nextRequiredNode = requiredNodes.find(
				(node) => !existingChildNodes.includes(node)
			);
			if (nextRequiredNode) return true;

			// Check current child node's data
			const currentChildKey = existingChildNodes[existingChildNodes.length - 1];
			return validateActionChild(`${actionId}_${currentChildKey}`, actionData);
		};

		// Get current action IDs
		const currentActionIds = actions?.map((action) => action.value) || [];

		// Map through nodes and validate each one
		return nodes.map((node) => {
			const getError = () => {
				// Main workflow nodes validation
				if (nodeSequence.includes(node.id)) {
					return validateNodeData(node.id) || !hasNextNode(node.id);
				}

				// Action child node validation
				if (node.id.includes("_")) {
					const parentActionId = node.id.split("_")[0];
					return validateActionChild(node.id, actionsData[parentActionId]);
				}

				// Parent action node validation
				if (currentActionIds.includes(node.id)) {
					return validateParentAction(node.id, actionsData[node.id]);
				}

				return false;
			};

			return {
				...node,
				data: {
					...node.data,
					error: getError(),
				},
			};
		});
	};

	const handleModalSubmit = async () => {
		let isValid = {
			createNode: false,
			requiredFields: false,
		};

		const [actionId, currentModalContent] = modalContent?.includes("_")
			? modalContent.split("_")
			: [null, modalContent];

		const validateAllNodes = validateNodes(nodes, workflowData);
		setNodes(validateAllNodes);

		switch (currentModalContent) {
			case NODE_TYPES.MAIN: {
				isValid = validateAndAddNode(NODE_TYPES.DEPARTMENT, [
					"workflowName",
					"workflowFor",
				]);

				if (isValid.requiredFields) {
					setValidationError("Please fill out all required fields");
					return;
				}

				if (isValid.createNode) {
					addNodeAndEdge(NODE_TYPES.MAIN, {
						id: NODE_TYPES.DEPARTMENT,
						name: "Department",
						job: "Department Selection",
						emoji: "🔗",
						position: NODE_POSITIONS.DEPARTMENT,
						onClick: true,
					});
					if (userData?.isCoreTeam === "0") {
						addNodeAndEdge(NODE_TYPES.DEPARTMENT, {
							id: NODE_TYPES.SERVICE,
							name: "Service",
							job: "Service Selection",
							emoji: "🔧",
							position: NODE_POSITIONS.SERVICE,
							onClick: true,
						});
					}
				}
				break;
			}

			case NODE_TYPES.DEPARTMENT: {
				isValid = validateAndAddNode(NODE_TYPES.SERVICE, ["departmentId"]);
				if (isValid.requiredFields) {
					setValidationError("Please fill out all required fields");
					return;
				}

				if (isValid.createNode) {
					addNodeAndEdge(NODE_TYPES.DEPARTMENT, {
						id: NODE_TYPES.SERVICE,
						name: "Service",
						job: "Service Selection",
						emoji: "🔧",
						position: NODE_POSITIONS.SERVICE,
						onClick: true,
					});
				}
				break;
			}

			case NODE_TYPES.SERVICE: {
				isValid = validateAndAddNode(NODE_TYPES.ACTIONS, ["services"]);
				if (isValid.requiredFields) {
					setValidationError("Please fill out all required fields");
					return;
				}

				if (isValid.createNode) {
					addNodeAndEdge(NODE_TYPES.SERVICE, {
						id: NODE_TYPES.ACTIONS,
						name: "Actions",
						job: "Actions",
						emoji: "🔗",
						position: NODE_POSITIONS.ACTIONS,
						onClick: true,
					});
				}
				break;
			}

			case NODE_TYPES.ACTIONS: {
				try {
					isValid = validateAndAddNode(NODE_TYPES.ACTIONS, ["actions"]);
					if (isValid.requiredFields) {
						setValidationError("Please fill out all required fields");
						return;
					}

					const currentActionIds = workflowData.actions
						.map((action) => action.value)
						.filter(Boolean);

					const updatedActionsData = {};
					currentActionIds.forEach((actionId) => {
						updatedActionsData[actionId] = workflowData.actionsData?.[
							actionId
						] || {
							serviceMethod: "",
							roles: "",
							rolesWiseUsers: [],
							users: [],
							TAT: "",
							maxPriorityLimit: "",
						};
					});

					// Core workflow nodes that should not be removed
					const coreNodes = ["main", "department", "service", "actions"];

					const nodesToRemove = nodes.filter(
						(node) =>
							!node.id.includes("_") &&
							!coreNodes.includes(node.id) &&
							!currentActionIds.includes(node.id)
					);

					nodesToRemove.forEach((nodeToRemove) => {
						const childNodes = nodes.filter((node) =>
							node.id.startsWith(`${nodeToRemove.id}_`)
						);
						childNodes.forEach((node) => removeNodeAndEdge(node.id));
						removeNodeAndEdge(nodeToRemove.id);
					});

					workflowData.actions.forEach((action, index) => {
						if (!action?.value) return;

						const newPosition = calculateNodePosition(index);
						const existingNode = nodes.find((node) => node.id === action.value);

						const updateNodesCallback = (prevNodes) =>
							prevNodes.map((node) => {
								if (node.id === action.value) {
									return { ...node, position: newPosition };
								}
								if (node.id.startsWith(`${action.value}_`)) {
									return {
										...node,
										position: {
											...node.position,
											y: newPosition.y,
										},
									};
								}
								return node;
							});

						if (existingNode) {
							setNodes(updateNodesCallback);
						} else {
							const newNodeId = addNodeAndEdge(NODE_TYPES.ACTIONS, {
								id: action.value,
								name: action.label,
								job: action.label,
								emoji: "🔗",
								onClick: false,
								position: newPosition,
							});

							const roleUserNodeId = `${newNodeId}_${NODE_TYPES.SERVICE_METHOD}`;
							if (!nodes.find((node) => node.id === roleUserNodeId)) {
								addNodeAndEdge(newNodeId, {
									id: roleUserNodeId,
									name: "Select service method",
									job: "Role or User Selection",
									emoji: "👤",
									position: {
										x: newPosition.x + 250,
										y: newPosition.y,
									},
									onClick: true,
								});
							}
						}
					});

					setWorkflowData((prev) => ({
						...prev,
						actionsData: updatedActionsData,
					}));
				} catch (error) {
					console.error(error);
				}
				break;
			}

			case NODE_TYPES.SERVICE_METHOD: {
				const serviceMethod = workflowData.actionsData[actionId].serviceMethod;

				isValid = validateAndAddNode(
					serviceMethod === "0"
						? `${actionId}_${NODE_TYPES.ROLE_LIST}`
						: `${actionId}_${NODE_TYPES.USER_LIST}`,
					[`actionsData.${actionId}.serviceMethod`]
				);

				if (isValid.requiredFields) {
					setValidationError("Please fill out all required fields");
					return;
				}

				if (isValid.createNode) {
					if (serviceMethod === "0") {
						const userListNodeId = `${actionId}_${NODE_TYPES.ROLE_LIST}`;

						let dynamicPosition = nodes.find(
							(node) => node.id === modalContent
						)?.position;

						if (dynamicPosition) {
							let updatedPosition = {
								...dynamicPosition,
								x: dynamicPosition.x + 250,
							};

							addNodeAndEdge(modalContent, {
								id: userListNodeId,
								name: "Select Role",
								job: "Role List Selection",
								emoji: "📋",
								position: updatedPosition,
								onClick: true,
							});
						}

						removeNodeAndEdge(`${actionId}_${NODE_TYPES.USER_LIST}`);
						removeNodeAndEdge(`${actionId}_${NODE_TYPES.TAT}`);

						setWorkflowData((prevData) => ({
							...prevData,
							actionsData: {
								...prevData.actionsData,
								[actionId]: {
									...prevData.actionsData[actionId],
									roles: null,
									rolesWiseUsers: [],
									users: [],
								},
							},
						}));
					} else {
						const userListNodeId = `${actionId}_${NODE_TYPES.USER_LIST}`;

						let dynamicPosition = nodes.find(
							(node) => node.id === modalContent
						)?.position;

						if (dynamicPosition) {
							let updatedPosition = {
								...dynamicPosition,
								x: dynamicPosition.x + 250,
							};

							addNodeAndEdge(modalContent, {
								id: userListNodeId,
								name: "Select Agents",
								job: "Role List Selection",
								emoji: "📋",
								position: updatedPosition,
								onClick: true,
							});

							removeNodeAndEdge(`${actionId}_${NODE_TYPES.ROLE_LIST}`);
							removeNodeAndEdge(`${actionId}_${NODE_TYPES.ROLES_WISE_USERS}`);
							removeNodeAndEdge(`${actionId}_${NODE_TYPES.TAT}`);

							setWorkflowData((prevData) => ({
								...prevData,
								actionsData: {
									...prevData.actionsData,
									[actionId]: {
										...prevData.actionsData[actionId],
										roles: null,
										rolesWiseUsers: [],
										users: [],
									},
								},
							}));
						}
					}
				}
				break;
			}

			case NODE_TYPES.ROLE_LIST: {
				isValid = validateAndAddNode(
					`${actionId}_${NODE_TYPES.ROLES_WISE_USERS}`,
					[`actionsData.${actionId}.roles`]
				);

				if (isValid.requiredFields) {
					setValidationError("Please fill out all required fields");
					return;
				}

				if (isValid.createNode) {
					const dynamicPosition = nodes.find(
						(node) => node.id === modalContent
					)?.position;

					if (dynamicPosition) {
						const updatedPosition = {
							...dynamicPosition,
							x: dynamicPosition.x + 250,
						};
						addNodeAndEdge(modalContent, {
							id: `${actionId}_${NODE_TYPES.ROLES_WISE_USERS}`,
							name: "Select Agents for Role",
							job: "Role or Agents Selection",
							emoji: "👤",
							position: updatedPosition,
							onClick: true,
						});
					}
				}
				break;
			}

			case NODE_TYPES.USER_LIST: {
				isValid = validateAndAddNode(`${actionId}_${NODE_TYPES.TAT}`, [
					`actionsData.${actionId}.users`,
					`actionsData.${actionId}.maxPriorityLimit`,
				]);
				if (isValid.requiredFields) {
					setValidationError("Please fill out all required fields");
					return;
				}

				if (isValid.createNode) {
					const dynamicPosition = nodes.find(
						(node) => node.id === modalContent
					)?.position;

					if (dynamicPosition) {
						const updatedPosition = {
							...dynamicPosition,
							x: dynamicPosition.x + 250,
						};
						addNodeAndEdge(modalContent, {
							id: `${actionId}_${NODE_TYPES.TAT}`,
							name: "TAT",
							job: "TAT Selection",
							emoji: "⏱️",
							position: updatedPosition,
							onClick: true,
						});
					}
				}
				break;
			}

			case NODE_TYPES.ROLES_WISE_USERS: {
				isValid = validateAndAddNode(`${actionId}_${NODE_TYPES.TAT}`, [
					`actionsData.${actionId}.rolesWiseUsers`,
					`actionsData.${actionId}.maxPriorityLimit`,
				]);
				if (isValid.requiredFields) {
					setValidationError("Please provide Roles and Users for this action");
					return;
				}
				if (isValid.createNode) {
					const dynamicPosition = nodes.find(
						(node) => node.id === modalContent
					)?.position;

					if (dynamicPosition) {
						const updatedPosition = {
							...dynamicPosition,
							x: dynamicPosition.x + 250,
						};
						addNodeAndEdge(modalContent, {
							id: `${actionId}_${NODE_TYPES.TAT}`,
							name: "TAT",
							job: "TAT Selection",
							emoji: "⏱️",
							position: updatedPosition,
							onClick: true,
						});
					}
				}
				break;
			}

			case NODE_TYPES.TAT: {
				isValid = validateAndAddNode(`${actionId}_${NODE_TYPES.TAT}`, [
					`actionsData.${actionId}.TAT`,
				]);
				if (isValid.requiredFields) {
					setValidationError("Please provide TAT for this action");
					return;
				}

				// if (
				// 	validateAllNodes &&
				// 	validateAllNodes.every((node) => node?.data?.error === false)
				// ) {
				// 	await createWorkflowApi(validateAllNodes);
				// }
				break;
			}

			default:
				break;
		}

		setModalOpen(false);
		setValidationError("");
	};

	console.log(workflowData);
	console.log(nodes);

	const renderModalContent = () => {
		const actionId = modalContent?.includes("_")
			? modalContent.split("_")[0]
			: null;

		const currentAction = actionId
			? actionOptions.find((a) => a.value === actionId)?.label
			: null;

		const onDragEndForActions = (result) => {
			if (!result.destination) return;

			const recordedactions = Array.from(workflowData.actions) || [];

			const [removed] = recordedactions.splice(result.source.index, 1);
			recordedactions.splice(result.destination.index, 0, removed);

			setWorkflowData((prevData) => ({
				...prevData,
				actions: recordedactions,
			}));
		};

		const onDragEndForUsers = (result, fieldName) => {
			if (!result.destination) return;

			const reorderedUsers = Array.from(
				workflowData.actionsData[actionId]?.[fieldName] || []
			);
			const [removed] = reorderedUsers.splice(result.source.index, 1);
			reorderedUsers.splice(result.destination.index, 0, removed);

			setWorkflowData((prevData) => ({
				...prevData,
				actionsData: {
					...prevData.actionsData,
					[actionId]: {
						...prevData.actionsData[actionId],
						[fieldName]: reorderedUsers,
					},
				},
			}));
		};

		const handleRemoveAction = (actionToRemove) => {
			const updatedActions = workflowData.actions.filter(
				(action) => action.value !== actionToRemove.value
			);

			setWorkflowData((prevData) => ({
				...prevData,
				actions: updatedActions.map((action, index) => ({
					...action,
					order: index + 1,
				})),
			}));
		};

		const handleRemoveUser = (userToRemove, fieldName) => {
			const updatedUsers = workflowData.actionsData[actionId]?.[
				fieldName
			].filter((user) => user !== userToRemove);

			setWorkflowData((prevData) => ({
				...prevData,
				actionsData: {
					...prevData.actionsData,
					[actionId]: {
						...prevData.actionsData[actionId],
						[fieldName]: updatedUsers,
					},
				},
			}));
		};

		// Determine if the source should be agents or the support team
		// If it's a service or (ticket and the action is "escalate" (actionId === "2")), use agents.
		// Otherwise, for tickets, use the support team.
		const isAgentSource =
			workflowData?.workflowFor === "0" ||
			(workflowData?.workflowFor === "1" && actionId === "2");

		// Matches the user's role with the roles defined in the action's data.
		const filterByRole = (users) =>
			users?.filter(
				(user) => user?.roleId === workflowData.actionsData[actionId]?.roles
			);

		const currentAgentsList = isAgentSource ? userLists : supportTeamUsers;

		// Filter the current user list to include only users matching the required role
		const currentRoleWiseAgentsList = filterByRole(currentAgentsList);

		const agentsOptions = isAgentSource
			? usersOptions
			: supportTeamUsersOptions;

		const roleWiseAgentsOptions = filterByRole(currentAgentsList)?.map(
			(user) => ({
				value: user.id,
				label: user.name,
			})
		);

		const modalComponents = {
			[NODE_TYPES.MAIN]: (
				<Form>
					<FormGroup>
						<Label for="workflowName">Workflow Name</Label>
						<Input
							type="text"
							value={workflowData?.workflowName}
							onChange={(e) => {
								setWorkflowData((prevData) => ({
									...prevData,
									workflowName: e.target.value,
								}));
							}}
							placeholder="Enter workflow name"
						/>
					</FormGroup>
					<FormGroup tag="fieldset">
						<Label>Workflow For</Label>
						<FormGroup check>
							<Input
								type="radio"
								name="workflowFor"
								id="service"
								value="0"
								checked={workflowData.workflowFor === "0"}
								onChange={(e) => handleWorkflowForChange(e.target.value)}
							/>
							<Label check htmlFor="service">
								Service
							</Label>
						</FormGroup>
						<FormGroup check>
							<Input
								type="radio"
								name="workflowFor"
								id="ticket"
								value="1"
								checked={workflowData.workflowFor === "1"}
								onChange={(e) => handleWorkflowForChange(e.target.value)}
							/>
							<Label check htmlFor="ticket">
								Ticket
							</Label>
						</FormGroup>
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.DEPARTMENT]: (
				<Form>
					<FormGroup tag="fieldset">
						<Label>Department</Label>
						<FormGroup check>
							<Select
								options={departmentOptions}
								value={
									departmentOptions?.find(
										(dept) => dept.value === workflowData?.departmentId
									) ?? null
								}
								onChange={(selectedOption) => {
									handleDepartmentChange(selectedOption?.value);
								}}
								isDisabled={userData?.isCoreTeam === "0"}
								placeholder="Choose a department..."
								className="bg-choice text-start border border-1 border-primary rounded border-opacity-10 z-2"
							/>
						</FormGroup>
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.SERVICE]: (
				<Form>
					<FormGroup tag="fieldset">
						<Label>Select Services</Label>
						<FormGroup>
							<Select
								isMulti
								options={services?.map((service) => ({
									value: service.slug,
									label: service.serviceName,
									isDisabled: prevWorkflows.includes(service.slug),
								}))}
								value={workflowData.services.map((option) => {
									const service = services.find(
										(service) => service.slug === option
									);
									return service
										? {
												value: service.slug,
												label: service.serviceName,
										  }
										: null;
								})}
								onChange={(selectedOptions) => {
									setWorkflowData({
										...workflowData,
										services: selectedOptions.map((option) => option.value),
									});
								}}
								placeholder="Choose services..."
								isClearable
								className="bg-choice"
							/>
						</FormGroup>
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.ACTIONS]: (
				<Form>
					<FormGroup tag="fieldset">
						<Label>Select Actions</Label>
						<FormGroup>
							<Select
								isMulti
								options={actionOptions}
								value={workflowData.actions}
								onChange={(selectedOptions) => {
									const sortedSelectedOptions =
										workflowData?.workflowFor === "1"
											? selectedOptions.sort((a, b) => a.value - b.value)
											: selectedOptions;

									setWorkflowData({
										...workflowData,
										actions: sortedSelectedOptions,
									});
								}}
								placeholder="Choose actions..."
								isClearable
								className="bg-choice"
							/>
						</FormGroup>
						{/* Drag-and-drop list */}
						{workflowData?.actions?.length > 0 &&
							workflowData?.workflowFor === "0" && (
								<>
									<DragDropContext
										onDragEnd={(result) => onDragEndForActions(result)}>
										<Droppable droppableId="actionsList">
											{(provided) => (
												<div
													{...provided.droppableProps}
													ref={provided.innerRef}
													className="mt-3 bg-light p-2 rounded border">
													{workflowData?.actions?.map((action, index) => (
														<Draggable
															key={action.value}
															draggableId={action.value}
															index={index}>
															{(provided) => (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	{...provided.dragHandleProps}
																	className="d-flex align-items-center justify-content-between bg-white p-2 mb-2 border rounded">
																	<span className="me-2">{index + 1}.</span>
																	<span className="flex-grow-1">
																		{action.label}
																	</span>

																	<Button
																		color="danger"
																		size="sm"
																		onClick={() => handleRemoveAction(action)}
																		className="ms-2"
																		title="Remove Action">
																		<svg
																			stroke="currentColor"
																			fill="currentColor"
																			strokeWidth="0"
																			viewBox="0 0 24 24"
																			className="cursor-pointer"
																			height="1em"
																			width="1em"
																			xmlns="http://www.w3.org/2000/svg">
																			<path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path>
																		</svg>
																	</Button>
																</div>
															)}
														</Draggable>
													))}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
									</DragDropContext>
									<p className="text-muted mt-3">
										You can prioritize actions by dragging them up or down.
										<br />
										<strong>Note:</strong> Actions will be prioritized based on
										their order in the list.
									</p>
								</>
							)}
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.SERVICE_METHOD]: (
				<Form>
					<FormGroup tag="fieldset">
						<Label>Select Service Method for {currentAction}</Label>
						<FormGroup>
							<Select
								options={serviceMethodOptions}
								value={
									serviceMethodOptions?.find(
										(method) =>
											method.value ===
											workflowData?.actionsData[actionId]?.serviceMethod
									) ?? null
								}
								onChange={(selectedOption) => {
									setWorkflowData((prevData) => ({
										...prevData,
										actionsData: {
											...prevData.actionsData,
											[actionId]: {
												...prevData.actionsData[actionId],
												serviceMethod: selectedOption?.value,
											},
										},
									}));
								}}
								placeholder="Choose a service method..."
								className="bg-choice text-start border border-1 border-primary rounded border-opacity-10 z-2"
							/>
						</FormGroup>
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.ROLE_LIST]: (
				<Form>
					<FormGroup tag="fieldset">
						<Label>Select Roles for {currentAction}</Label>
						<FormGroup>
							<Select
								options={
									workflowData?.workflowFor === "0" ||
									(workflowData?.workflowFor === "1" && actionId === "2")
										? rolesOptions
										: supportRolesOptions
								}
								value={
									(workflowData?.workflowFor === "0" ||
									(workflowData?.workflowFor === "1" && actionId === "2")
										? rolesOptions
										: supportRolesOptions
									)?.find(
										(role) =>
											role.value == workflowData?.actionsData[actionId]?.roles
									) ?? null
								}
								onChange={(selectedOption) => {
									setWorkflowData((prevData) => ({
										...prevData,
										actionsData: {
											...prevData.actionsData,
											[actionId]: {
												...prevData.actionsData[actionId],
												roles: selectedOption?.value || "",
												rolesWiseUsers: [],
												users: [],
												maxPriorityLimit: "",
											},
										},
									}));
								}}
								placeholder="Choose a service method..."
								className="bg-choice text-start border border-1 border-primary rounded border-opacity-10 z-2"
							/>
						</FormGroup>
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.USER_LIST]: (
				<Form>
					<FormGroup tag="fieldset">
						<Label>Select Agents for {currentAction} Action</Label>
						<FormGroup>
							<Select
								isMulti
								options={agentsOptions}
								value={
									workflowData.actionsData[actionId]?.users
										?.map((userId) =>
											currentAgentsList?.find((user) => user.id === userId)
										)
										?.filter(Boolean)
										?.map((user) => ({
											value: user.id,
											label: user.name,
										})) ?? []
								}
								onChange={(selectedOptions) => {
									setWorkflowData((prevData) => ({
										...prevData,
										actionsData: {
											...prevData.actionsData,
											[actionId]: {
												...prevData.actionsData[actionId],
												users:
													selectedOptions.map((option) => option.value) || [],
												roles: null,
												rolesWiseUsers: [],
											},
										},
									}));
								}}
								placeholder="Choose agents..."
								isClearable
								className="bg-choice"
							/>
						</FormGroup>
						{/* Drag-and-drop list */}
						{workflowData?.actionsData?.[actionId]?.users?.length > 0 && (
							<>
								<DragDropContext
									onDragEnd={(result) => onDragEndForUsers(result, "users")}>
									<Droppable droppableId="usersList">
										{(provided) => (
											<div
												{...provided.droppableProps}
												ref={provided.innerRef}
												className="mt-3 bg-light p-2 rounded border">
												{workflowData.actionsData[actionId]?.users?.map(
													(user, index) => (
														<Draggable
															key={user}
															draggableId={String(user)}
															index={index}>
															{(provided) => (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	{...provided.dragHandleProps}
																	className="d-flex align-items-center justify-content-between bg-white p-2 mb-2 border rounded">
																	<span className="me-2">{index + 1}.</span>
																	<span className="flex-grow-1">
																		{
																			currentAgentsList.find(
																				(u) => u.id === user
																			)?.name
																		}
																	</span>

																	<Button
																		color="danger"
																		size="sm"
																		onClick={() =>
																			handleRemoveUser(user, "users")
																		}
																		className="ms-2"
																		title="Remove user">
																		<svg
																			stroke="currentColor"
																			fill="currentColor"
																			strokeWidth="0"
																			viewBox="0 0 24 24"
																			className="cursor-pointer"
																			height="1em"
																			width="1em"
																			xmlns="http://www.w3.org/2000/svg">
																			<path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path>
																		</svg>
																	</Button>
																</div>
															)}
														</Draggable>
													)
												)}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
								<p className="mt-2">
									<i className="ri-information-line align-middle me-1"></i> You
									can prioritize agents by dragging them up or down. Agents will
									be prioritized based on their order in the list.
								</p>
							</>
						)}
						<FormGroup>
							<Label for="maxPriorityLimit">Max Priority Limit</Label>
							<Input
								type="number"
								min={0}
								id="maxPriorityLimit"
								value={workflowData.actionsData[actionId]?.maxPriorityLimit}
								onChange={(e) =>
									setWorkflowData((prev) => ({
										...prev,
										actionsData: {
											...prev.actionsData,
											[actionId]: {
												...prev.actionsData[actionId],
												maxPriorityLimit: e.target.value,
											},
										},
									}))
								}
								placeholder="Enter max priority limit"
							/>
							<p>
								<small>
									<i className="ri-information-line align-middle me-1"></i>
									<span>
										The max priority limit is the maximum number of applications
										or tickets that can be assigned to agent on priority basis.
									</span>
								</small>
							</p>
						</FormGroup>
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.ROLES_WISE_USERS]: (
				<Form>
					<FormGroup tag="fieldset">
						<Label>Select Agents for {currentAction} Action</Label>
						<FormGroup>
							<Select
								isMulti
								options={roleWiseAgentsOptions}
								value={
									workflowData.actionsData[actionId]?.rolesWiseUsers
										?.map((userId) =>
											currentRoleWiseAgentsList?.find(
												(user) => user.id === userId
											)
										)
										?.filter(Boolean)
										?.map((user) => ({
											value: user.id,
											label: user.name,
										})) ?? []
								}
								onChange={(selectedOptions) => {
									setWorkflowData((prevData) => ({
										...prevData,
										actionsData: {
											...prevData.actionsData,
											[actionId]: {
												...prevData.actionsData[actionId],
												rolesWiseUsers:
													selectedOptions.map((option) => option.value) || [],
												users: [],
											},
										},
									}));
								}}
								placeholder="Choose agents..."
								isClearable
								className="bg-choice"
							/>
						</FormGroup>
						{/* Drag-and-drop list */}
						{workflowData?.actionsData?.[actionId]?.rolesWiseUsers?.length >
							0 && (
							<>
								<DragDropContext
									onDragEnd={(result) =>
										onDragEndForUsers(result, "rolesWiseUsers")
									}>
									<Droppable droppableId="usersList">
										{(provided) => (
											<div
												{...provided.droppableProps}
												ref={provided.innerRef}
												className="mt-3 bg-light p-2 rounded border">
												{workflowData.actionsData[
													actionId
												]?.rolesWiseUsers?.map((user, index) => (
													<Draggable
														key={user}
														draggableId={String(user)}
														index={index}>
														{(provided) => (
															<div
																ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																className="d-flex align-items-center justify-content-between bg-white p-2 mb-2 border rounded">
																{/* Display order number */}
																<span className="me-2">{index + 1}.</span>
																<span className="flex-grow-1">
																	{
																		currentRoleWiseAgentsList.find(
																			(u) => u.id == user
																		)?.name
																	}
																</span>

																{/* Remove button */}
																<Button
																	color="danger"
																	size="sm"
																	onClick={() =>
																		handleRemoveUser(user, "rolesWiseUsers")
																	}
																	className="ms-2"
																	title="Remove user">
																	<svg
																		stroke="currentColor"
																		fill="currentColor"
																		strokeWidth="0"
																		viewBox="0 0 24 24"
																		className="cursor-pointer"
																		height="1em"
																		width="1em"
																		xmlns="http://www.w3.org/2000/svg">
																		<path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path>
																	</svg>
																</Button>
															</div>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
								<p className="mt-2">
									<i className="ri-information-line align-middle me-1"></i> You
									can prioritize agents by dragging them up or down. Agents will
									be prioritized based on their order in the list.
								</p>
							</>
						)}
						<FormGroup>
							<Label for="maxPriorityLimit">Max Priority Limit</Label>
							<Input
								type="number"
								min={0}
								id="maxPriorityLimit"
								value={workflowData.actionsData[actionId]?.maxPriorityLimit}
								onChange={(e) =>
									setWorkflowData((prev) => ({
										...prev,
										actionsData: {
											...prev.actionsData,
											[actionId]: {
												...prev.actionsData[actionId],
												maxPriorityLimit: e.target.value,
											},
										},
									}))
								}
								placeholder="Enter max priority limit"
							/>
							<p>
								<small>
									<i className="ri-information-line align-middle me-1"></i>
									<span>
										The max priority limit is the maximum number of applications
										or tickets that can be assigned to agent on priority basis.
									</span>
								</small>
							</p>
						</FormGroup>
					</FormGroup>
				</Form>
			),
			[NODE_TYPES.TAT]: (
				<Form>
					<FormGroup>
						<Label for="workflowName">TAT for {currentAction}</Label>
						<Input
							type="number"
							min={0}
							id="workflowName"
							value={workflowData.actionsData[actionId]?.TAT}
							onChange={(e) => {
								setWorkflowData((prevData) => ({
									...prevData,
									actionsData: {
										...prevData.actionsData,
										[actionId]: {
											...prevData.actionsData[actionId],
											TAT: e.target.value,
										},
									},
								}));
							}}
							placeholder="Enter TAT for this action"
						/>
					</FormGroup>
				</Form>
			),
		};

		return modalComponents?.[modalContent?.split("_")[1] || modalContent];
	};

	return (
		<div style={{ width: "100%", height: "85vh" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onConnect={onConnect}
				nodeTypes={{ custom: CustomNode }}
				edgeTypes={edgeTypes}
				onNodeClick={(_, node) => {
					node.data.onClick && handleNodeClick(node.id);
				}}>
				<Background />
			</ReactFlow>

			<Col className="col-12 col-xl-3 col-xxl-2 d-flex justify-content-end align-items-end w-100">
				<button
					className="btn btn-secondary me-3"
					onClick={() => {
						navigate("/workflow");
					}}>
					Cancel
				</button>
				<button
					className="btn btn-primary me-5"
					disabled={isSubmitting}
					onClick={async () => {
						const validate = validateNodes(nodes, workflowData);
						setNodes(validate);

						if (
							validate &&
							validate.every((node) => node?.data?.error === false)
						) {
							await createWorkflowApi(validate);
						}
					}}>
					{isSubmitting && (
						<Spinner
							animation="border"
							size="sm"
							role="status"
							aria-hidden="true"
							className="fs-15 me-2"
						/>
					)}

					<span className="fs-15">
						{" "}
						{workflowId ? "Update" : "Save"} Workflow
					</span>
				</button>
			</Col>

			<Modal
				centered
				backdrop="static"
				isOpen={modalOpen}
				toggle={() => {
					setModalOpen(false);
					setValidationError("");
					const validate = validateNodes(nodes, workflowData);
					setNodes(validate);
				}}>
				<ModalHeader
					toggle={() => {
						setModalOpen(false);
						setValidationError("");
						const validate = validateNodes(nodes, workflowData);
						setNodes(validate);
					}}>
					Configure Workflow
				</ModalHeader>
				<ModalBody>
					{renderModalContent()}

					{validationError && (
						<div className="text-danger">{validationError}</div>
					)}
				</ModalBody>
				<ModalFooter>
					<Button
						color="secondary"
						onClick={() => {
							setModalOpen(false);
							setValidationError("");
							const validate = validateNodes(nodes, workflowData);
							setNodes(validate);
						}}>
						Cancel
					</Button>
					{isSubmitting ? (
						<Button color="primary" disabled>
							<Spinner
								animation="border"
								size="sm"
								role="status"
								aria-hidden="true"
								className="fs-13"
							/>
							<span className="fs-13"> Submitting... </span>
						</Button>
					) : (
						<Button color="primary" onClick={handleModalSubmit}>
							Submit
						</Button>
					)}
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default Flow;
