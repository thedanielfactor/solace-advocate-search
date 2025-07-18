"use client";

import { useEffect, useState } from "react";
import type { 
  Advocate, 
  ApiResponse, 
  InputChangeHandler, 
  ButtonClickHandler
} from "@/types";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdvocates = async (): Promise<void> => {
      try {
        console.log("fetching advocates...");
        const response = await fetch("/api/advocates");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonResponse: ApiResponse<Advocate[]> = await response.json();
        
        if (jsonResponse.error) {
          throw new Error(jsonResponse.error);
        }
        
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching advocates:", error);
        setIsLoading(false);
        // In a real app, you'd want to set an error state here
      }
    };

    fetchAdvocates();
  }, []);

  const onChange: InputChangeHandler = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    console.log("filtering advocates...");
    const filteredAdvocates = advocates.filter((advocate) => {
      return (
        advocate.firstName.includes(newSearchTerm) ||
        advocate.lastName.includes(newSearchTerm) ||
        advocate.city.includes(newSearchTerm) ||
        advocate.degree.includes(newSearchTerm) ||
        advocate.specialties.includes(newSearchTerm) ||
        advocate.yearsOfExperience.toString().includes(newSearchTerm)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick: ButtonClickHandler = () => {
    console.log(advocates);
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span>{searchTerm}</span>
        </p>
        <input style={{ border: "1px solid black" }} onChange={onChange} />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      {isLoading ? (
        <p>Loading advocates...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>City</th>
              <th>Degree</th>
              <th>Specialties</th>
              <th>Years of Experience</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdvocates.map((advocate, index) => {
              return (
                <tr key={advocate.id || index}>
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    {advocate.specialties.map((s, specialtyIndex) => (
                      <div key={`${advocate.id || index}-${specialtyIndex}`}>{s}</div>
                    ))}
                  </td>
                  <td>{advocate.yearsOfExperience}</td>
                  <td>{advocate.phoneNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
