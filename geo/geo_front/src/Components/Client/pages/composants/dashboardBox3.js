
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IoIosTimer } from "react-icons/io";
import axios from 'axios';



const DashboardBox3 = (props) => {
    const [zones, setZones] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const ITEM_HEIGHT = 48;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
    // Récupération zones
    axios.get("http://127.0.0.1:8000/api/zones")
      .then(response => setZones(response.data))
      .catch(error => console.error(error));

        console.log("color prop:", (props.color))
    }, [props.color])
    return (
        <Button className="dashboardBox " style={
            { backgroundImage: `linear-gradient(to right, ${props.color?.[0]} , ${props.color?.[1]})` }
        }>

            {
                props.grow === true ?
                    <span className='chart'><TrendingUpIcon /></span>
                    :
                    <span className='chart'><TrendingDownIcon /></span>
            }

            <div className='d-flex w-100'>
                <div className='col1'>
                    <h4 className='text-white'>Total Zones couvertes</h4>
                    <span className='text-white'>{zones.length}</span>
                </div>

                <div className='ml-auto'>
                    {
                        props.icon ?
                            <span className='icon'>
                                {props.icon ? props.icon : ''}
                            </span>
                            :
                            ''
                    }

                </div>
            </div>

            <div className='d-flex align-items-center w-100 bottomEle'>
                <h6 className='text-white mb-0 mt-0'>Dernier mois</h6>
                <div className='ml-auto'>
                    <Button className='ml-auto toggleIcon' onClick={handleClick}><HiDotsVertical /></Button>
                    <Menu
                        className="dropDown_menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                            paper: {
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: '20ch',
                                },
                            },
                        }}
                    >
                        <MenuItem onClick={handleClose}>
                            <IoIosTimer />Dernier jour
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <IoIosTimer /> Dernier semaine
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <IoIosTimer />Dernier mois
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <IoIosTimer /> Dernier année
                        </MenuItem>
                    </Menu>
                </div>
            </div>
        </Button>
    )
}

DashboardBox3.propTypes = {
    color: PropTypes.arrayOf(PropTypes.string).isRequired, // Assure que 'color' est une string obligatoire
    icon: PropTypes.string,
    grow: PropTypes.bool,
};

export default DashboardBox3;