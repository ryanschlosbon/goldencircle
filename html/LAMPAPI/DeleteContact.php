<?php
	//header('Access-Control-Allow-Origin: http://thegoldencircle.online');
	header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-type');
	$inData = getRequestInfo();
	
    $id = $inData["id"];

	if(!$id){
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
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE id=?");
		$stmt->bind_param("s", $id);
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