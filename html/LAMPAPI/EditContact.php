<?php
	//header('Access-Control-Allow-Origin: http://thegoldencircle.online');
	header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-type');
	$inData = getRequestInfo();
	
	$first = $inData["first"];
	$last= $inData["last"];
	$email = $inData["email"];
	$phone = $inData["phone"];
    $id = $inData["id"];

	if(!$first || !$last || !$email || !$phone || !$id){
        echo json_encode(['success'=> false,'message'=> 'JSON Required Fields Blank Error']);
        exit;
    }

	$conn = new mysqli("localhost", "admin", "adminpassword", "contact_manager");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error);
	} 
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET first=?, last=?, email=?, phone=? WHERE id=?");
		$stmt->bind_param("sssss", $first, $last, $email, $phone, $id);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>