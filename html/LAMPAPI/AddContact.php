<?php
	//header('Access-Control-Allow-Origin: http://thegoldencircle.online');
	header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-type');
	$inData = getRequestInfo();
	
	$first = $inData["first"];
	$last= $inData["last"];
	$email = $inData["email"];
	$phone = $inData["phone"];
	$userID = $inData["userID"];

	if(!$first || !$last || !$email || !$phone){
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
		$stmt = $conn->prepare("INSERT into Contacts (userID,first,last,email,phone) VALUES(?,?,?,?,?)");
		$stmt->bind_param("sssss", $userID, $first, $last, $email, $phone);
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