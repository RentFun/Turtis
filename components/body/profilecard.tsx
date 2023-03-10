function UserNftCard({ turtle }: { turtle: IUserNftWithMetadata }) {
    return (
        <div
            className={`container w-70 text-center p-1 border-0 rounded-lg bg-whiteish font-primary`} >
            <div className='text-xl px-2'>
                <h5 className='text-left text-xl'>{turtle.metadata.name+"-"+turtle.tokenId}</h5>
            </div>
            <div className='bg-blue w-cover border-0 rounded-lg p-2'>
                <img className='pt-5' src={turtle.metadata.image} alt="placeholder" style={{ height: '220', width: '180'}}/>
            </div>
            <div className='text-xl w-full flex flex-row flex-wrap justify-center py-1'>
                {turtle.metadata.attributes.map((attr) => (
                    <div className='px-2' key={attr.trait_type}>
                        {attr.trait_type} : {attr.value}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserNftCard;
