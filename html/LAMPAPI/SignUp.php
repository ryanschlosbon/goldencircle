<?php
    //header('Access-Control-Allow-Origin: http://thegoldencircle.online');
	header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-type');

    $data = json_decode(file_get_contents('php://input'), true);
    if($data === null){
        echo json_encode(['success' => false,'message' => 'JSON Data Error']);
        exit;
    }

    $first = $data['firstName'];
    $last = $data['lastName'];
    $login = $data['login'];
    $password = $data['password'];

    if(!$first || !$last || !$login || !$password){
        echo json_encode(['success'=> false,'message'=> 'JSON Required Fields Blank Error']);
        exit;
    }

    $serverName = 'localhost';
    $DBUser = 'admin';
    $DBPassword = 'adminpassword';
    $DBName = 'contact_manager';
    $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];

    try{
        $conn = new PDO("mysql: host=$serverName;dbname=$DBName", $DBUser, $DBPassword, $options);

        $stmt = $conn->prepare("INSERT INTO Users (first, last, login, password) VALUES ( ? , ? , ? , ?)");
        $stmt->bindParam(1, $first);
        $stmt->bindParam(2, $last);
        $stmt->bindParam(3, $login);
        $stmt->bindParam(4, $password);

        $stmt->execute();
    } catch(PDOException $e){
        echo json_encode(["success"=> false,"message"=> "Database Error " . $e->getMessage()]);
        exit;
    }

    echo json_encode(["success"=> true,"message"=> "User Created!"]);

    $conn = null;
?>