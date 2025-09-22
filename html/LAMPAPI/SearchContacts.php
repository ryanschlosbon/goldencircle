<?php
	//header('Access-Control-Allow-Origin: http://thegoldencircle.online');
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Headers: Content-type');
	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "admin", "adminpassword", "contact_manager");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("select * from Contacts where (first like ? OR last like ? OR email like ? OR phone like ?) and userID=?");
		$contactInfo = "%" . $inData["search"] . "%";
		$stmt->bind_param("sssss", $contactInfo, $contactInfo, $contactInfo, $contactInfo, $inData["userID"]);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
            $searchResults .= '{"first" : "' . $row["first"]. '", "last" : "' . $row["last"]. '", "email" : "' . $row["email"]. '", "phone" : "' . $row["phone"]. '", "id" : "' . $row["id"]. '"}';
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}
		
		$stmt->close();
		$conn->close();
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
		$retValue = '{"id":0,"first":"","last":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
