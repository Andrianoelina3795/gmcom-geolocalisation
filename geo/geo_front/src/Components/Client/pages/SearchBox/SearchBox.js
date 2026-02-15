import { IoSearch } from "react-icons/io5";

const SearchBox = () =>{
    return(
        <div className="searchBox position-relative d-flex align-items-center" style={{ marginLeft: '10px'}}>
            <IoSearch className="mr-2" size={20} color="gray"/>
            <input type="text" placeholder="  Recherche..." />
        </div>
    )
}
export default SearchBox;